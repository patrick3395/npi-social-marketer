"use client";

import { useState } from "react";
import { HistoryEntry } from "@/lib/storage";
import { PLATFORM_CONFIG, Platform } from "@/lib/constants";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./PlatformIcons";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryEntry[];
}

const icons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

const FILTER_TABS: { label: string; value: Platform | "all" }[] = [
  { label: "All", value: "all" },
  { label: "FB", value: "facebook" },
  { label: "IG", value: "instagram" },
  { label: "LI", value: "linkedin" },
];

export default function HistoryPanel({ isOpen, onClose, history }: HistoryPanelProps) {
  const [filter, setFilter] = useState<Platform | "all">("all");

  if (!isOpen) return null;

  const filtered = filter === "all" ? history : history.filter((h) => h.platform === filter);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#111] border-l border-[#222] animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">Post History</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">&times;</button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 px-5 py-3 border-b border-[#222]">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1 text-xs rounded-md transition ${
                filter === tab.value
                  ? "bg-[#222] text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* History list */}
        <div className="flex-1 overflow-y-auto dark-scrollbar p-4 space-y-3">
          {filtered.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-8">No post history yet.</p>
          )}
          {filtered.map((entry) => {
            const Icon = icons[entry.platform];
            const config = PLATFORM_CONFIG[entry.platform];
            return (
              <div key={entry.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span
                    className={`ml-auto text-xs px-1.5 py-0.5 rounded ${
                      entry.status === "success"
                        ? "bg-emerald-900/50 text-emerald-400"
                        : "bg-red-900/50 text-red-400"
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{entry.preview}</p>
                <span className="text-xs text-zinc-600 mt-1 block">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
                {entry.error && (
                  <p className="text-xs text-red-400 mt-1">{entry.error}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
