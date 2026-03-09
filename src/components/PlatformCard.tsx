"use client";

import { useState } from "react";
import { fal } from "@fal-ai/client";
import { FacebookIcon, InstagramIcon, LinkedInIcon, BookmarkIcon } from "./PlatformIcons";
import { Platform, PLATFORM_CONFIG } from "@/lib/constants";

interface PlatformCardProps {
  platform: Platform;
  content: string;
  onContentChange: (content: string) => void;
  onPost: () => void;
  onSaveDraft: () => void;
  isPosting: boolean;
  isConnected: boolean;
  imagePrompt: string;
  imagePromptLoading: boolean;
  onGenerateImagePrompt: () => void;
  falApiKey: string;
  onError: (msg: string) => void;
}

const icons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

const IMAGE_DIMENSIONS: Record<Platform, { width: number; height: number }> = {
  facebook: { width: 1200, height: 628 },
  instagram: { width: 1080, height: 1080 },
  linkedin: { width: 1200, height: 627 },
};

const VIDEO_ASPECT_RATIOS: Record<Platform, "16:9" | "1:1" | "9:16"> = {
  facebook: "16:9",
  instagram: "1:1",
  linkedin: "16:9",
};

function downloadBlob(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function PlatformCard({
  platform,
  content,
  onContentChange,
  onPost,
  onSaveDraft,
  isPosting,
  isConnected,
  imagePrompt,
  imagePromptLoading,
  onGenerateImagePrompt,
  falApiKey,
  onError,
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Image generation state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Video generation state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const config = PLATFORM_CONFIG[platform];
  const Icon = icons[platform];
  const charCount = content.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const handleGenerateImage = async () => {
    if (!falApiKey) {
      onError("fal.ai API key required. Add one in Settings.");
      return;
    }
    if (!imagePrompt) {
      onError("Generate an image prompt first, then generate the image.");
      return;
    }

    setImageLoading(true);
    setImageUrl(null);
    try {
      fal.config({ credentials: falApiKey });
      const dims = IMAGE_DIMENSIONS[platform];
      const result = await fal.subscribe("fal-ai/flux/schnell", {
        input: {
          prompt: imagePrompt,
          image_size: { width: dims.width, height: dims.height },
          num_images: 1,
        },
      });
      const data = result.data as { images?: { url: string }[] };
      if (data.images && data.images.length > 0) {
        setImageUrl(data.images[0].url);
      } else {
        onError("No image was returned from fal.ai");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Image generation failed";
      onError(msg);
    } finally {
      setImageLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const ts = Date.now();
    downloadBlob(imageUrl, `npi-${platform}-${ts}.png`);
  };

  const handleGenerateVideo = async () => {
    if (!falApiKey) {
      onError("fal.ai API key required. Add one in Settings.");
      return;
    }
    if (!content) {
      onError("Generate post content first before creating a video.");
      return;
    }

    setVideoLoading(true);
    setVideoUrl(null);
    setVideoProgress(0);
    try {
      fal.config({ credentials: falApiKey });
      // Condense content to key themes for video prompt
      const videoPrompt = content
        .replace(/#\w+/g, "")
        .replace(/\n+/g, " ")
        .trim()
        .slice(0, 500);

      const result = await fal.subscribe("fal-ai/kling-video/v1.6/standard/text-to-video", {
        input: {
          prompt: videoPrompt,
          duration: "5",
          aspect_ratio: VIDEO_ASPECT_RATIOS[platform],
        },
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            const logs = (update as unknown as { logs?: { message: string }[] }).logs;
            if (logs && logs.length > 0) {
              const pctMatch = logs[logs.length - 1].message.match(/(\d+)%/);
              if (pctMatch) setVideoProgress(parseInt(pctMatch[1]));
            }
          }
        },
      });
      const data = result.data as { video?: { url: string } };
      if (data.video?.url) {
        setVideoUrl(data.video.url);
      } else {
        onError("No video was returned from fal.ai");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Video generation failed";
      onError(msg);
    } finally {
      setVideoLoading(false);
      setVideoProgress(0);
    }
  };

  const handleDownloadVideo = () => {
    if (!videoUrl) return;
    const ts = Date.now();
    downloadBlob(videoUrl, `npi-${platform}-${ts}.mp4`);
  };

  const borderClass =
    platform === "facebook"
      ? "border-t-[3px] border-t-[#1877F2]"
      : platform === "linkedin"
        ? "border-t-[3px] border-t-[#0A66C2]"
        : "ig-gradient-border";

  return (
    <div className={`bg-[#141414] rounded-xl border border-[#222] overflow-hidden ${borderClass}`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#222]">
        <Icon className="w-5 h-5" />
        <h3 className="font-semibold text-white text-sm">{config.label}</h3>
        <div className="ml-auto flex items-center gap-2">
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Connected" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-zinc-600" title="Not connected" />
          )}
          <button
            onClick={handleSaveDraft}
            disabled={!content}
            className="text-zinc-500 hover:text-amber-400 transition disabled:opacity-30"
            title="Save as draft"
          >
            <BookmarkIcon className="w-4 h-4" filled={draftSaved} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={7}
          className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 resize-y focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-600 dark-scrollbar"
        />

        {/* Char count + actions */}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs ${charCount > config.maxChars ? "text-red-500 font-medium" : "text-zinc-600"}`}
          >
            {charCount.toLocaleString()} / {config.maxChars.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!content}
              className="px-3 py-1.5 text-xs font-medium border border-[#333] rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition disabled:opacity-30"
            >
              {copied ? (
                <span className="animate-checkmark inline-flex items-center gap-1">
                  <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied
                </span>
              ) : "Copy"}
            </button>
            <button
              onClick={onPost}
              disabled={isPosting || !isConnected || !content}
              className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: config.color }}
            >
              {isPosting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting
                </span>
              ) : "Post Now"}
            </button>
          </div>
        </div>

        {/* Image Generation */}
        <div className="border-t border-[#222] pt-3 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onGenerateImagePrompt}
              disabled={imagePromptLoading || !content}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1.5 disabled:opacity-30"
            >
              {imagePromptLoading ? (
                <>
                  <Spinner />
                  Generating prompt...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  Generate Image Prompt
                </>
              )}
            </button>

            <button
              onClick={handleGenerateImage}
              disabled={imageLoading || !imagePrompt}
              className="px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {imageLoading ? (
                <>
                  <Spinner />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  Generate Image
                </>
              )}
            </button>
          </div>

          {/* Image prompt preview */}
          {imagePrompt && !imageUrl && (
            <div className="bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{imagePrompt}</p>
            </div>
          )}

          {/* Generated image display */}
          {imageUrl && (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-[#222]">
                <img src={imageUrl} alt={`Generated ${platform} image`} className="w-full h-auto" />
              </div>
              <button
                onClick={handleDownloadImage}
                className="px-3 py-1.5 text-xs font-medium border border-[#333] rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Image
              </button>
            </div>
          )}
        </div>

        {/* Video Generation */}
        <div className="border-t border-[#222] pt-3 space-y-3">
          <button
            onClick={handleGenerateVideo}
            disabled={videoLoading || !content}
            className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {videoLoading ? (
              <>
                <Spinner />
                Generating Video{videoProgress > 0 ? ` (${videoProgress}%)` : "..."}
              </>
            ) : (
              <>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
                Generate Video
              </>
            )}
          </button>

          {/* Video progress bar */}
          {videoLoading && videoProgress > 0 && (
            <div className="w-full bg-[#0a0a0a] rounded-full h-1.5 border border-[#222]">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${videoProgress}%` }}
              />
            </div>
          )}

          {/* Generated video display */}
          {videoUrl && (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-[#222]">
                <video src={videoUrl} controls className="w-full h-auto" />
              </div>
              <button
                onClick={handleDownloadVideo}
                className="px-3 py-1.5 text-xs font-medium border border-[#333] rounded-lg text-zinc-400 hover:text-white hover:border-zinc-500 transition flex items-center gap-1.5"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
