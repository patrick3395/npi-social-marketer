import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const SYSTEM_PROMPT = `You are a social media content creator for Noble Property Inspections (NPI), a home inspection company operating across Texas, Florida, Colorado, Georgia, California, Alabama, and Louisiana.

Key NPI differentiators you MUST weave into content naturally:
- Engineer-owned: Phil and Patrick, licensed professional engineers, own and operate NPI. This is RARE in the inspection industry — most companies are not run by engineers.
- Same-day reports: Clients get their inspection report the same day. No waiting around.
- Crystal clear pricing: No hidden fees, no surprises. Pricing is upfront and transparent.
- Family owned and operated: NPI is a family business, not a faceless corporation.
- 7-day admin staff: Their admin team is available 7 days a week for scheduling and questions.
- Supra ELB eKeys: Inspectors carry Supra ELB eKeys for realtor lockbox access — makes scheduling seamless for agents.
- Phone: (832) 551-1397
- Website: noble-pi.com

Content rules:
- Write authentic, specific content — NOT generic inspection company copy
- Reference real scenarios, real concerns homebuyers face
- Mention the specific market when relevant
- Keep content engaging and scroll-stopping
- Never use placeholder text or brackets like [insert X]
- Do NOT include image suggestions or image descriptions — text content only

You will generate content for three platforms simultaneously. Return ONLY valid JSON with this exact structure:
{
  "facebook": "...",
  "instagram": "...",
  "linkedin": "..."
}

Platform guidelines:
- Facebook: Longer copy (150-300 words). Use emoji sparingly but effectively. Include a clear CTA. Add 3-5 relevant hashtags at the end.
- Instagram: Punchy caption (100-200 words). Emoji-forward — use them to break up text and add energy. Heavy hashtags (15-25) at the end, mix of industry and local.
- LinkedIn: Professional tone (150-250 words). Industry insight angle — position NPI as thought leaders. Minimal hashtags (3-5). No emoji or very minimal.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, market, goal, tone, anthropicApiKey } = body;

    if (!service || !market || !goal || !tone) {
      return NextResponse.json(
        { error: "Missing required fields: service, market, goal, tone" },
        { status: 400 }
      );
    }

    const apiKey = anthropicApiKey || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "No Anthropic API key configured. Add one in Settings or set ANTHROPIC_API_KEY on the server." },
        { status: 400 }
      );
    }

    const client = new Anthropic({ apiKey });

    const userPrompt = `Generate social media content for all 3 platforms with these parameters:
- Service: ${service}
- Market: ${market}
- Goal: ${goal}
- Tone: ${tone}

Return valid JSON only — no markdown, no code fences, no explanation.`;

    const message = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(textBlock.text);

    if (!parsed.facebook || !parsed.instagram || !parsed.linkedin) {
      return NextResponse.json(
        { error: "Incomplete response from Claude" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Generate error:", error);
    const message =
      error instanceof Error ? error.message : "Content generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
