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
    const shapeDescription = describeConstellation(constellation);

    // STEP 1: Generate title and story FIRST based on the shape
    // This ensures the mythology drives the image, not the other way around
    const mythPrompt = `You are an ancient astronomer naming a new constellation.

Looking at the star pattern described below, imagine what mythological figure, creature, or symbol it could represent. Consider the shape's characteristics carefully.

Shape: ${shapeDescription}

Create a mythological identity for this constellation. Generate a JSON response with:
- "title": A classical constellation name (e.g., "Cygnus", "The Archer's Bow", "Serpens Minor", "The Weeping Maiden")
- "figure": What the constellation depicts - be specific (e.g., "a swan in flight", "a hunter drawing a bow", "a coiled serpent")
- "story": A 2-3 sentence mythological origin story in the style of ancient Greek/Roman star lore

The figure should naturally fit the described shape - if it's tall and vertical, perhaps a standing figure; if horizontal with extensions, perhaps a creature with outstretched limbs.`;

    const mythResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: mythPrompt,
      config: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "Classical constellation name",
            },
            figure: {
              type: Type.STRING,
              description: "What the constellation depicts",
            },
            story: {
              type: Type.STRING,
              description: "Mythological origin story",
            },
          },
          required: ["title", "figure", "story"],
        },
      },
    });

    let title = "Unknown Constellation";
    let figure = "a mythological figure";
    let story = "";

    try {
      const mythText = mythResponse.text;
      if (mythText) {
        const parsed = JSON.parse(mythText);
        title = parsed.title || title;
        figure = parsed.figure || figure;
        story = parsed.story || story;
      }
    } catch (e) {
      console.error("Failed to parse myth response:", e);
    }

    // STEP 2: Generate image using the mythology as guidance
    const imagePrompt = `Create an illustration of the constellation "${title}" which depicts ${figure}.

CRITICAL REQUIREMENTS:
1. The attached image shows the EXACT star positions - these are sacred anchor points
2. Your illustration must use ALL visible stars as key points of the figure (joints, eyes, extremities, etc.)
3. Do NOT add any additional stars - only the ones shown should appear
4. Do NOT move or reposition any stars - they must remain in their exact locations
5. The figure (${figure}) should be drawn so its anatomy naturally connects through these star positions

STYLE:
- Semi-transparent ethereal figure in sepia/blue-grey ink wash style
- Dark night sky background that extends seamlessly to all edges
- NO borders, frames, or decorative elements
- NO title text or labels
- The figure should blend naturally with the star field
- Soft, classical astronomical illustration aesthetic

The constellation lines in the reference show how stars connect - the figure should follow this structure while depicting ${figure}.`;

    // Prepare content parts
    const contentParts: Array<string | { inlineData: { data: string; mimeType: string } }> = [];
    
    // Add the constellation canvas image
    if (canvasImage) {
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
    
    contentParts.push(imagePrompt);

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

  // Normalize to the constellation's own bounding box for shape analysis
  const minX = Math.min(...stars.map(s => s.x));
  const maxX = Math.max(...stars.map(s => s.x));
  const minY = Math.min(...stars.map(s => s.y));
  const maxY = Math.max(...stars.map(s => s.y));
  
  const shapeWidth = maxX - minX || 1;
  const shapeHeight = maxY - minY || 1;
  const aspectRatio = shapeWidth / shapeHeight;
  
  const descriptions: string[] = [];
  
  // Shape orientation
  if (aspectRatio > 1.8) {
    descriptions.push("horizontally elongated, wider than tall");
  } else if (aspectRatio < 0.55) {
    descriptions.push("vertically elongated, taller than wide");
  } else {
    descriptions.push("roughly square in proportion");
  }
  
  // Connection analysis
  const connectionCounts = new Array(stars.length).fill(0);
  for (const line of lines) {
    if (line.a < stars.length) connectionCounts[line.a]++;
    if (line.b < stars.length) connectionCounts[line.b]++;
  }
  
  const maxConnections = Math.max(...connectionCounts);
  const hubCount = connectionCounts.filter(c => c === maxConnections && c > 2).length;
  
  if (hubCount > 0) {
    descriptions.push(`with ${hubCount} central hub point${hubCount > 1 ? 's' : ''} where multiple lines meet`);
  }
  
  // Detect loops/closed shapes
  const hasLoop = detectLoop(lines, stars.length);
  if (hasLoop) {
    descriptions.push("forming a closed loop or ring shape");
  }
  
  // Endpoints (potential extremities)
  const endpoints = connectionCounts.filter(c => c === 1).length;
  if (endpoints >= 4) {
    descriptions.push(`with ${endpoints} extending endpoints (like limbs or rays)`);
  } else if (endpoints === 2) {
    descriptions.push("with two terminal points (like a line or arc)");
  } else if (endpoints === 3) {
    descriptions.push("with three terminal points (like a trident or fork)");
  }
  
  // Relative positions of key stars
  const topStars = stars.filter(s => s.y < minY + shapeHeight * 0.3).length;
  const bottomStars = stars.filter(s => s.y > maxY - shapeHeight * 0.3).length;
  
  if (topStars === 1 && bottomStars > 2) {
    descriptions.push("with a single point at top spreading to a wider base");
  } else if (bottomStars === 1 && topStars > 2) {
    descriptions.push("with a wide top narrowing to a single point at bottom");
  }
  
  descriptions.push(`composed of ${stars.length} stars connected by ${lines.length} lines`);
  
  return descriptions.join(", ");
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
