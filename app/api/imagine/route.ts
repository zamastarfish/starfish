import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60 * 1000,
};

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetIn: RATE_LIMIT.windowMs };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count, resetIn: record.resetTime - now };
}

export async function POST(request: NextRequest) {
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before generating another image." },
      { status: 429 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Image generation not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { constellation, canvasImage } = body;

    if (!constellation || !constellation.stars || !constellation.lines) {
      return NextResponse.json(
        { error: "Invalid constellation data" },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build the prompt with the constellation image if available
    const prompt = `You are looking at a constellation pattern drawn by a user connecting stars in the night sky.

Your task:
1. Study the exact shape formed by the connected stars - these are the ONLY stars that exist
2. Imagine what mythological figure, creature, or symbol this constellation could represent
3. Create an artistic illustration where the figure naturally fits the star positions

CRITICAL STYLE REQUIREMENTS:
- Dark night sky background that seamlessly extends to all edges
- NO borders, frames, or decorative edges
- NO title labels, cartouches, or text of any kind
- NO additional stars beyond the constellation points shown - use ONLY the exact stars visible in the reference
- The figure should be semi-transparent/ethereal, drawn with soft ink wash technique
- Muted sepia and blue-grey tones that blend with the night sky
- The illustration should look like it could seamlessly overlay the original star field
- Edges should fade naturally into the dark background, not have hard boundaries

The figure should be positioned so its key anatomical points (joints, eyes, hands, etc.) align with the star positions in the reference image.

Generate ONLY the figure on a dark sky - no frames, no labels, no extra stars.`;

    // Prepare content parts
    const contentParts: Array<string | { inlineData: { data: string; mimeType: string } }> = [];
    
    // Add the constellation canvas image if provided
    if (canvasImage) {
      // canvasImage is expected to be a data URL like "data:image/png;base64,..."
      const base64Match = canvasImage.match(/^data:([^;]+);base64,(.+)$/);
      if (base64Match) {
        contentParts.push({
          inlineData: {
            mimeType: base64Match[1],
            data: base64Match[2],
          },
        });
      }
    }
    
    contentParts.push(prompt);

    // Generate the image
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: contentParts,
    });

    // Extract image from response
    let generatedImage: string | null = null;
    const imageParts = imageResponse.candidates?.[0]?.content?.parts || [];

    for (const part of imageParts) {
      const inlineData = part.inlineData;
      if (inlineData?.data) {
        const mimeType = inlineData.mimeType || "image/png";
        generatedImage = `data:${mimeType};base64,${inlineData.data}`;
        break;
      }
    }

    if (!generatedImage) {
      console.error("No image in response. Parts:", JSON.stringify(imageParts, null, 2));
      return NextResponse.json(
        { error: "No image was generated." },
        { status: 500 }
      );
    }

    // Now generate the title and story using a text model
    const storyPrompt = `Based on a constellation pattern that was just interpreted as a mythological figure, create a brief mythological backstory.

The constellation appears to be: ${describeConstellation(constellation)}

Generate a JSON response with:
- "title": A mythological name for this constellation (e.g., "Andromeda", "The Hunter's Bow", "Serpens Minor")
- "story": A 2-3 sentence mythological origin story in the style of ancient Greek/Roman star lore

Respond with valid JSON only.`;

    const storyResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: storyPrompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Mythological name for the constellation",
            },
            story: {
              type: Type.STRING,
              description: "Brief mythological origin story",
            },
          },
          required: ["title", "story"],
        },
      },
    });

    let title = "Unknown Constellation";
    let story = "";

    try {
      const storyText = storyResponse.text;
      if (storyText) {
        const parsed = JSON.parse(storyText);
        title = parsed.title || title;
        story = parsed.story || story;
      }
    } catch (e) {
      console.error("Failed to parse story response:", e);
    }

    return NextResponse.json({
      image: generatedImage,
      title,
      story,
      remaining: rateLimit.remaining,
    });

  } catch (error) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

function describeConstellation(constellation: {
  stars: Array<{ x: number; y: number }>;
  lines: Array<{ a: number; b: number }>;
  width: number;
  height: number;
}): string {
  const { stars, lines, width, height } = constellation;
  
  if (stars.length === 0) return "a single point of light";
  if (stars.length === 1) return "a single bright star";
  if (lines.length === 0) return "scattered stars";

  const normalized = stars.map(s => ({
    x: s.x / width,
    y: s.y / height,
  }));

  const minX = Math.min(...normalized.map(s => s.x));
  const maxX = Math.max(...normalized.map(s => s.x));
  const minY = Math.min(...normalized.map(s => s.y));
  const maxY = Math.max(...normalized.map(s => s.y));
  
  const shapeWidth = maxX - minX;
  const shapeHeight = maxY - minY;
  const aspectRatio = shapeWidth / (shapeHeight || 0.01);
  
  const descriptions: string[] = [];
  
  if (aspectRatio > 2) {
    descriptions.push("horizontally elongated");
  } else if (aspectRatio < 0.5) {
    descriptions.push("vertically elongated, tall");
  }
  
  const connectionCounts = new Array(stars.length).fill(0);
  for (const line of lines) {
    if (line.a < stars.length) connectionCounts[line.a]++;
    if (line.b < stars.length) connectionCounts[line.b]++;
  }
  
  const maxConnections = Math.max(...connectionCounts);
  const hubCount = connectionCounts.filter(c => c === maxConnections && c > 2).length;
  
  if (hubCount > 0) {
    descriptions.push(`with ${hubCount} central hub point${hubCount > 1 ? 's' : ''}`);
  }
  
  const hasLoop = detectLoop(lines, stars.length);
  if (hasLoop) {
    descriptions.push("forming a closed shape");
  }
  
  const endpoints = connectionCounts.filter(c => c === 1).length;
  if (endpoints > 2) {
    descriptions.push(`with ${endpoints} extending points or limbs`);
  }
  
  descriptions.push(`composed of ${stars.length} stars connected by ${lines.length} lines`);
  
  return descriptions.join(", ") || "an abstract pattern of connected stars";
}

function detectLoop(lines: Array<{ a: number; b: number }>, numStars: number): boolean {
  if (lines.length < 3) return false;
  
  const adj: number[][] = Array.from({ length: numStars }, () => []);
  for (const line of lines) {
    if (line.a < numStars && line.b < numStars) {
      adj[line.a].push(line.b);
      adj[line.b].push(line.a);
    }
  }
  
  const visited = new Set<number>();
  
  function dfs(node: number, parent: number): boolean {
    visited.add(node);
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        return true;
      }
    }
    return false;
  }
  
  const firstConnected = lines[0]?.a ?? 0;
  if (firstConnected < numStars) {
    return dfs(firstConnected, -1);
  }
  return false;
}
