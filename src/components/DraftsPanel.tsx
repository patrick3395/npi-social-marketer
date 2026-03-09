"use client";

import { Draft } from "@/lib/storage";
import { PLATFORM_CONFIG } from "@/lib/constants";
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "./PlatformIcons";

interface DraftsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: Draft[];
  onRemoveDraft: (id: string) => void;
  onPostAllDrafts: () => void;
  postingAll: boolean;
}

const icons = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
};

export default function DraftsPanel({
  isOpen,
  onClose,
  drafts,
  onRemoveDraft,
  onPostAllDrafts,
  postingAll,
}: DraftsPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 animate-fade-in" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#111] border-l border-[#222] animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">Saved Drafts</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg">&times;</button>
        </div>

        {/* Drafts list */}
        <div className="flex-1 overflow-y-auto dark-scrollbar p-4 space-y-3">
          {drafts.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-8">No saved drafts yet.</p>
          )}
          {drafts.map((draft) => {
            const Icon = icons[draft.platform];
            const config = PLATFORM_CONFIG[draft.platform];
            return (
              <div key={draft.id} className="bg-[#1a1a1a] border border-[#222] rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium" style={{ color: config.color }}>
                    {config.label}
                  </span>
                  <span className="text-xs text-zinc-600 ml-auto">
                    {new Date(draft.savedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">{draft.content}</p>
                <button
                  onClick={() => onRemoveDraft(draft.id)}
                  className="mt-2 text-xs text-zinc-600 hover:text-red-400 transition"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {drafts.length > 0 && (
          <div className="px-5 py-4 border-t border-[#222]">
            <button
              onClick={onPostAllDrafts}
              disabled={postingAll}
              className="w-full px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {postingAll ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Posting...
                </>
              ) : `Post All Drafts (${drafts.length})`}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
