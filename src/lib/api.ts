import { Credentials, GenerateResponse } from "./constants";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

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

async function callAnthropic(apiKey: string, system: string, userMessage: string): Promise<string> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: "Anthropic API error" } }));
    throw new Error(err.error?.message || `Anthropic API error (${res.status})`);
  }

  const data = await res.json();
  const textBlock = data.content?.find((b: { type: string }) => b.type === "text");
  if (!textBlock) throw new Error("No text response from Claude");
  return textBlock.text;
}

export async function generateContent(
  service: string,
  market: string,
  goal: string,
  tone: string,
  apiKey: string
): Promise<GenerateResponse> {
  if (!apiKey) throw new Error("Anthropic API key required. Add one in Settings.");

  const userPrompt = `Generate social media content for all 3 platforms with these parameters:
- Service: ${service}
- Market: ${market}
- Goal: ${goal}
- Tone: ${tone}

Return valid JSON only — no markdown, no code fences, no explanation.`;

  const text = await callAnthropic(apiKey, SYSTEM_PROMPT, userPrompt);
  const parsed = JSON.parse(text);
  if (!parsed.facebook || !parsed.instagram || !parsed.linkedin) {
    throw new Error("Incomplete response from Claude");
  }
  return parsed;
}

export async function generateImagePrompt(
  platform: "facebook" | "instagram" | "linkedin",
  content: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) throw new Error("Anthropic API key required. Add one in Settings.");

  const dimensions: Record<string, string> = {
    facebook: "1200x628 landscape",
    instagram: "1080x1080 square",
    linkedin: "1200x627 wide landscape",
  };

  const userPrompt = `Based on this ${platform} social media post, generate an image prompt optimized for Midjourney or DALL-E.

Post content:
${content}

Requirements:
- Optimized for ${dimensions[platform]} format
- Professional, modern aesthetic suitable for a home inspection company brand
- Photorealistic or clean graphic style
- Should complement the post content without containing text
- Include specific style keywords (lighting, composition, camera angle)

Return ONLY the image prompt text, nothing else. No explanation, no labels, no quotes.`;

  return await callAnthropic(apiKey, "You generate concise, high-quality image prompts for AI image generators.", userPrompt);
}

export async function postToFacebook(content: string, creds: Credentials): Promise<string> {
  const url = `https://graph.facebook.com/v19.0/${creds.facebookPageId}/feed`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: content,
      access_token: creds.metaPageAccessToken,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Facebook API error");
  return data.id;
}

export async function postToInstagram(content: string, creds: Credentials): Promise<string> {
  const containerUrl = `https://graph.facebook.com/v19.0/${creds.instagramAccountId}/media`;
  const containerRes = await fetch(containerUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caption: content,
      access_token: creds.metaPageAccessToken,
      media_type: "TEXT",
    }),
  });
  const containerData = await containerRes.json();
  if (!containerRes.ok) throw new Error(containerData?.error?.message || "Instagram container creation failed");

  const publishUrl = `https://graph.facebook.com/v19.0/${creds.instagramAccountId}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: containerData.id,
      access_token: creds.metaPageAccessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (!publishRes.ok) throw new Error(publishData?.error?.message || "Instagram publish failed");
  return publishData.id;
}

export async function postToLinkedin(content: string, creds: Credentials): Promise<string> {
  const url = "https://api.linkedin.com/v2/ugcPosts";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${creds.linkedinAccessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: `urn:li:organization:${creds.linkedinOrganizationId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: content },
          shareMediaCategory: "NONE",
        },
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
      },
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "LinkedIn API error");
  }
  const data = await res.json();
  return data.id;
}
