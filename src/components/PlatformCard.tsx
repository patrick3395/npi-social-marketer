"use client";

import { useState } from "react";
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
}

const icons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

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
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const [imgCopied, setImgCopied] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const config = PLATFORM_CONFIG[platform];
  const Icon = icons[platform];
  const charCount = content.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImagePrompt = async () => {
    await navigator.clipboard.writeText(imagePrompt);
    setImgCopied(true);
    setTimeout(() => setImgCopied(false), 2000);
  };

  const handleSaveDraft = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
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

        {/* Image Prompt Generator */}
        <div className="border-t border-[#222] pt-3">
          <button
            onClick={onGenerateImagePrompt}
            disabled={imagePromptLoading || !content}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition flex items-center gap-1.5 disabled:opacity-30"
          >
            {imagePromptLoading ? (
              <>
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
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

          {imagePrompt && (
            <div className="mt-2 bg-[#0a0a0a] border border-[#222] rounded-lg p-3">
              <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-wrap">{imagePrompt}</p>
              <button
                onClick={handleCopyImagePrompt}
                className="mt-2 text-xs text-zinc-600 hover:text-zinc-300 transition"
              >
                {imgCopied ? (
                  <span className="text-emerald-400 animate-checkmark">Copied!</span>
                ) : "Copy prompt"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
