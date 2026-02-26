import { GoogleGenerativeAI } from "@google/generative-ai";
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
    const { constellation } = body;

    if (!constellation || !constellation.stars || !constellation.lines) {
      return NextResponse.json(
        { error: "Invalid constellation data" },
        { status: 400 }
      );
    }

    const shapeDescription = describeConstellation(constellation);

    const prompt = `Create an antique star chart illustration in the style of classical astronomy engravings. 
Show a mythological figure or creature formed by constellation lines against a dark night sky.
The figure should match this shape: ${shapeDescription}
Style: Detailed ink and watercolor, aged parchment aesthetic, golden/sepia tones, 
like 17th century celestial atlases (Johannes Hevelius style).
Show constellation lines connecting stars that form the figure.
Include subtle star points at the vertices.`;

    // Use the Gemini REST API directly for image generation
    // Gemini 2.0 Flash supports native image generation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["image", "text"],
            responseMimeType: "image/png",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      
      // Try fallback model
      return await tryFallbackGeneration(apiKey, prompt);
    }

    const data = await response.json();
    
    // Extract image from response
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];
    
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        return NextResponse.json({
          image: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
          remaining: rateLimit.remaining,
        });
      }
    }

    // No image in response, try fallback
    console.error("No image in Gemini response, trying fallback");
    return await tryFallbackGeneration(apiKey, prompt);

  } catch (error) {
    console.error("Image generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: `Failed to generate image: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// Fallback to Imagen 3 via different endpoint
async function tryFallbackGeneration(apiKey: string, prompt: string) {
  try {
    // Try Imagen 3 via the predict endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "1:1",
            safetyFilterLevel: "block_only_high",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Imagen API error:", response.status, errorText);
      throw new Error(`Imagen API error: ${response.status}`);
    }

    const data = await response.json();
    const predictions = data.predictions || [];
    
    if (predictions[0]?.bytesBase64Encoded) {
      return NextResponse.json({
        image: `data:image/png;base64,${predictions[0].bytesBase64Encoded}`,
      });
    }

    throw new Error("No image in Imagen response");
  } catch (error) {
    console.error("Fallback generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
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
