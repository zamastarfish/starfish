import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiting
// In production, consider Vercel KV or Upstash Redis for distributed rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  maxRequests: 10, // requests per window
  windowMs: 60 * 1000, // 1 minute
};

function getRateLimitKey(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT.windowMs });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1, resetIn: RATE_LIMIT.windowMs };
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count, resetIn: record.resetTime - now };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60 * 1000);

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before generating another image." },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(rateLimit.resetIn / 1000)),
        }
      }
    );
  }

  // Check for API key
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

    // Analyze the constellation shape to generate a descriptive prompt
    const shapeDescription = describeConstellation(constellation);

    // Generate the image using Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use Imagen 3 model for image generation
    const model = genAI.getGenerativeModel({ 
      model: "imagen-3.0-generate-002",
    });

    const prompt = `Create an antique star chart illustration in the style of classical astronomy engravings. 
The image should show a mythological figure or creature formed by constellation lines against a dark night sky background.
The figure should match this shape: ${shapeDescription}
Style: Detailed ink and watercolor illustration, aged parchment aesthetic, golden/sepia tones, 
reminiscent of 17th century celestial atlases like those of Johannes Hevelius.
The constellation lines should be visible, connecting stars that form the figure.
Include subtle star points at the vertices of the constellation.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract image data from response
    // Imagen returns images in the response candidates
    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error("No image generated");
    }

    // Find the image part
    const imagePart = candidate.content.parts.find(
      (part: { inlineData?: { mimeType: string; data: string } }) => part.inlineData?.mimeType?.startsWith("image/")
    );

    if (!imagePart?.inlineData) {
      throw new Error("No image in response");
    }

    return NextResponse.json({
      image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
      remaining: rateLimit.remaining,
    });

  } catch (error) {
    console.error("Image generation error:", error);
    
    // Handle specific Gemini errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    if (errorMessage.includes("SAFETY")) {
      return NextResponse.json(
        { error: "Content filtered by safety settings. Try a different constellation." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}

// Analyze constellation shape and generate a description
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

  // Normalize coordinates to 0-1 range
  const normalized = stars.map(s => ({
    x: s.x / width,
    y: s.y / height,
  }));

  // Calculate bounding box
  const minX = Math.min(...normalized.map(s => s.x));
  const maxX = Math.max(...normalized.map(s => s.x));
  const minY = Math.min(...normalized.map(s => s.y));
  const maxY = Math.max(...normalized.map(s => s.y));
  
  const aspectRatio = (maxX - minX) / (maxY - minY || 0.01);
  
  // Determine overall shape characteristics
  const descriptions: string[] = [];
  
  // Aspect ratio description
  if (aspectRatio > 2) {
    descriptions.push("horizontally elongated");
  } else if (aspectRatio < 0.5) {
    descriptions.push("vertically elongated, tall");
  }
  
  // Count connections per star to find key points
  const connectionCounts = new Array(stars.length).fill(0);
  for (const line of lines) {
    connectionCounts[line.a]++;
    connectionCounts[line.b]++;
  }
  
  const maxConnections = Math.max(...connectionCounts);
  const hubCount = connectionCounts.filter(c => c === maxConnections && c > 2).length;
  
  if (hubCount > 0) {
    descriptions.push(`with ${hubCount} central hub point${hubCount > 1 ? 's' : ''}`);
  }
  
  // Check for closed loops
  const hasLoop = detectLoop(lines, stars.length);
  if (hasLoop) {
    descriptions.push("forming a closed shape");
  }
  
  // Number of branches/extensions
  const endpoints = connectionCounts.filter(c => c === 1).length;
  if (endpoints > 2) {
    descriptions.push(`with ${endpoints} extending points or limbs`);
  }
  
  // Star count
  descriptions.push(`composed of ${stars.length} stars connected by ${lines.length} lines`);
  
  return descriptions.join(", ") || "an abstract pattern of connected stars";
}

// Simple loop detection
function detectLoop(lines: Array<{ a: number; b: number }>, numStars: number): boolean {
  if (lines.length < 3) return false;
  
  // Build adjacency list
  const adj: number[][] = Array.from({ length: numStars }, () => []);
  for (const line of lines) {
    adj[line.a].push(line.b);
    adj[line.b].push(line.a);
  }
  
  // DFS to detect cycle
  const visited = new Set<number>();
  
  function dfs(node: number, parent: number): boolean {
    visited.add(node);
    for (const neighbor of adj[node]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor, node)) return true;
      } else if (neighbor !== parent) {
        return true; // Found a cycle
      }
    }
    return false;
  }
  
  // Check from first connected star
  const firstConnected = lines[0]?.a ?? 0;
  return dfs(firstConnected, -1);
}
