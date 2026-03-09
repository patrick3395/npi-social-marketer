import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content, pageAccessToken, igAccountId } = await request.json();

    if (!content || !pageAccessToken || !igAccountId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: content, pageAccessToken, igAccountId",
        },
        { status: 400 }
      );
    }

    // Step 1: Create media container (text-only post / caption-only)
    // Note: Instagram API requires either image_url or video_url for feed posts.
    // For text-only, we create a "STORIES" or use a placeholder approach.
    // In practice, you'd typically attach an image. This posts as a caption-only container.
    const containerUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caption: content,
        access_token: pageAccessToken,
        // For a real post, you'd include image_url here.
        // Instagram requires media — this will work if an image_url is provided in the future.
        media_type: "TEXT",
      }),
    });

    const containerData = await containerRes.json();

    if (!containerRes.ok) {
      const errorMsg =
        containerData?.error?.message ||
        "Instagram container creation failed. Note: Instagram requires an image or video for feed posts.";
      return NextResponse.json(
        { error: errorMsg },
        { status: containerRes.status }
      );
    }

    // Step 2: Publish the container
    const publishUrl = `https://graph.facebook.com/v19.0/${igAccountId}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: pageAccessToken,
      }),
    });

    const publishData = await publishRes.json();

    if (!publishRes.ok) {
      const errorMsg =
        publishData?.error?.message || "Instagram publish failed";
      return NextResponse.json(
        { error: errorMsg },
        { status: publishRes.status }
      );
    }

    return NextResponse.json({ success: true, postId: publishData.id });
  } catch (error: unknown) {
    console.error("Instagram post error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to post to Instagram";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
