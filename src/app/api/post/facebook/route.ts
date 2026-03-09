import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, pageAccessToken, pageId } = await request.json();

    if (!content || !pageAccessToken || !pageId) {
      return NextResponse.json(
        { error: "Missing required fields: content, pageAccessToken, pageId" },
        { status: 400 }
      );
    }

    const url = `https://graph.facebook.com/v19.0/${pageId}/feed`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: content,
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data?.error?.message || "Facebook API error";
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    return NextResponse.json({ success: true, postId: data.id });
  } catch (error: unknown) {
    console.error("Facebook post error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to post to Facebook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
