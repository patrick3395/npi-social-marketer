import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, accessToken, organizationId } = await request.json();

    if (!content || !accessToken || !organizationId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: content, accessToken, organizationId",
        },
        { status: 400 }
      );
    }

    const url = "https://api.linkedin.com/v2/ugcPosts";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:organization:${organizationId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: content,
            },
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
      const errorMsg =
        data?.message || data?.error || "LinkedIn API error";
      return NextResponse.json({ error: errorMsg }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, postId: data.id });
  } catch (error: unknown) {
    console.error("LinkedIn post error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to post to LinkedIn";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
