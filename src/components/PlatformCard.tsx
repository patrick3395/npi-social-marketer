"use client";

import { useState } from "react";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./PlatformIcons";

interface PlatformCardProps {
  platform: "facebook" | "instagram" | "linkedin";
  content: string;
  onContentChange: (content: string) => void;
  onPost: () => void;
  isPosting: boolean;
  isConnected: boolean;
}

const platformConfig = {
  facebook: {
    label: "Facebook",
    icon: FacebookIcon,
    color: "text-[#1877F2]",
    bg: "bg-[#1877F2]",
    maxChars: 63206,
  },
  instagram: {
    label: "Instagram",
    icon: InstagramIcon,
    color: "text-[#E4405F]",
    bg: "bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#dc2743]",
    maxChars: 2200,
  },
  linkedin: {
    label: "LinkedIn",
    icon: LinkedInIcon,
    color: "text-[#0A66C2]",
    bg: "bg-[#0A66C2]",
    maxChars: 3000,
  },
};

export default function PlatformCard({
  platform,
  content,
  onContentChange,
  onPost,
  isPosting,
  isConnected,
}: PlatformCardProps) {
  const [copied, setCopied] = useState(false);
  const config = platformConfig[platform];
  const Icon = config.icon;
  const charCount = content.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <h3 className="font-semibold text-gray-900">{config.label}</h3>
        {isConnected && (
          <span className="ml-auto w-2 h-2 rounded-full bg-green-500" title="Connected" />
        )}
        {!isConnected && (
          <span className="ml-auto w-2 h-2 rounded-full bg-gray-300" title="Not connected" />
        )}
      </div>

      <div className="p-4">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 resize-y focus:outline-none focus:ring-2 focus:ring-npi-blue focus:border-transparent"
        />
        <div className="flex items-center justify-between mt-2">
          <span
            className={`text-xs ${charCount > config.maxChars ? "text-red-500 font-medium" : "text-gray-400"}`}
          >
            {charCount.toLocaleString()} / {config.maxChars.toLocaleString()}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              onClick={onPost}
              disabled={isPosting || !isConnected || !content}
              className={`px-3 py-1.5 text-xs font-medium text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${config.bg} hover:opacity-90`}
            >
              {isPosting ? "Posting..." : "Post Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
