"use client";

import { useState, useEffect, useCallback } from "react";
import PlatformCard from "@/components/PlatformCard";
import SettingsModal from "@/components/SettingsModal";
import DraftsPanel from "@/components/DraftsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import Toast from "@/components/Toast";
import { BookmarkIcon, ClockIcon } from "@/components/PlatformIcons";
import {
  SERVICES,
  GOALS,
  TONES,
  Credentials,
  DEFAULT_CREDENTIALS,
  Platform,
} from "@/lib/constants";
import {
  generateContent,
  generateImagePrompt,
  postToFacebook as apiFacebook,
  postToInstagram as apiInstagram,
  postToLinkedin as apiLinkedin,
} from "@/lib/api";
import {
  loadCredentials,
  saveCredentials as storeCreds,
  loadDrafts,
  saveDraft,
  removeDraft as removeStoredDraft,
  loadHistory,
  addHistoryEntry,
  Draft,
  HistoryEntry,
} from "@/lib/storage";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

export default function Home() {
  const [service, setService] = useState(SERVICES[0]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [contentInput, setContentInput] = useState("");

  const [generating, setGenerating] = useState(false);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const [postingFb, setPostingFb] = useState(false);
  const [postingIg, setPostingIg] = useState(false);
  const [postingLi, setPostingLi] = useState(false);

  // Image prompts
  const [fbImagePrompt, setFbImagePrompt] = useState("");
  const [igImagePrompt, setIgImagePrompt] = useState("");
  const [liImagePrompt, setLiImagePrompt] = useState("");
  const [fbImgLoading, setFbImgLoading] = useState(false);
  const [igImgLoading, setIgImgLoading] = useState(false);
  const [liImgLoading, setLiImgLoading] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftsOpen, setDraftsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(DEFAULT_CREDENTIALS);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [postingAllDrafts, setPostingAllDrafts] = useState(false);

  useEffect(() => {
    setCredentials(loadCredentials());
    setDrafts(loadDrafts());
    setHistory(loadHistory());
  }, []);

  const handleSaveCredentials = (creds: Credentials) => {
    setCredentials(creds);
    storeCreds(creds);
    showToast("Settings saved", "success");
  };

  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  }, []);

  const fbConnected = !!(credentials.metaPageAccessToken && credentials.facebookPageId);
  const igConnected = !!(credentials.metaPageAccessToken && credentials.instagramAccountId);
  const liConnected = !!(credentials.linkedinAccessToken && credentials.linkedinOrganizationId);

  const handleGenerate = async () => {
    setGenerating(true);
    setFbImagePrompt("");
    setIgImagePrompt("");
    setLiImagePrompt("");
    try {
      const data = await generateContent(
        service,
        contentInput || "general content",
        goal,
        tone,
        credentials.anthropicApiKey
      );
      setFacebook(data.facebook);
      setInstagram(data.instagram);
      setLinkedin(data.linkedin);
      setHasGenerated(true);
      showToast("Content generated!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Generation failed";
      showToast(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  const handlePost = async (platform: Platform) => {
    const setPosting = { facebook: setPostingFb, instagram: setPostingIg, linkedin: setPostingLi }[platform];
    const content = { facebook, instagram, linkedin }[platform];
    const postFn = { facebook: apiFacebook, instagram: apiInstagram, linkedin: apiLinkedin }[platform];
    const label = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn" }[platform];

    setPosting(true);
    try {
      const postId = await postFn(content, credentials);
      showToast(`Posted to ${label}!`, "success");
      const entry = addHistoryEntry(platform, content, "success", postId);
      setHistory((prev) => [entry, ...prev]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : `${label} post failed`;
      showToast(msg, "error");
      const entry = addHistoryEntry(platform, content, "error", undefined, msg);
      setHistory((prev) => [entry, ...prev]);
    } finally {
      setPosting(false);
    }
  };

  const handleSaveDraft = (platform: Platform) => {
    const content = { facebook, instagram, linkedin }[platform];
    const draft = saveDraft(platform, content);
    setDrafts((prev) => [draft, ...prev]);
    showToast(`Draft saved!`, "success");
  };

  const handleRemoveDraft = (id: string) => {
    removeStoredDraft(id);
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  };

  const handlePostAllDrafts = async () => {
    setPostingAllDrafts(true);
    for (const draft of drafts) {
      const postFn = { facebook: apiFacebook, instagram: apiInstagram, linkedin: apiLinkedin }[draft.platform];
      try {
        const postId = await postFn(draft.content, credentials);
        const entry = addHistoryEntry(draft.platform, draft.content, "success", postId);
        setHistory((prev) => [entry, ...prev]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Post failed";
        const entry = addHistoryEntry(draft.platform, draft.content, "error", undefined, msg);
        setHistory((prev) => [entry, ...prev]);
      }
    }
    setPostingAllDrafts(false);
    showToast("All drafts posted!", "success");
  };

  const handleGenerateImagePrompt = async (platform: Platform) => {
    const content = { facebook, instagram, linkedin }[platform];
    const setLoading = { facebook: setFbImgLoading, instagram: setIgImgLoading, linkedin: setLiImgLoading }[platform];
    const setPrompt = { facebook: setFbImagePrompt, instagram: setIgImagePrompt, linkedin: setLiImagePrompt }[platform];

    setLoading(true);
    try {
      const prompt = await generateImagePrompt(platform, content, credentials.anthropicApiKey);
      setPrompt(prompt);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to generate image prompt";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-[#111] border-r border-[#222] flex flex-col z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#0a0a0a] font-bold text-xs">NPI</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">Social Marketer</h1>
              <p className="text-[10px] text-zinc-500">Noble Property Inspections</p>
            </div>
          </div>
        </div>

        {/* Content Input */}
        <div className="flex-1 overflow-y-auto dark-scrollbar p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Content Brief</label>
            <textarea
              value={contentInput}
              onChange={(e) => setContentInput(e.target.value)}
              rows={4}
              placeholder="Describe what you want to post about..."
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 resize-none focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Service Type</label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value as typeof service)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as typeof tone)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              {TONES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as typeof goal)}
              className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600"
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-4 py-2.5 bg-white text-[#0a0a0a] font-semibold text-sm rounded-lg hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>

        {/* Sidebar footer: Settings / Drafts / History */}
        <div className="px-4 py-3 border-t border-[#222] space-y-1">
          <button
            onClick={() => setDraftsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <BookmarkIcon className="w-3.5 h-3.5" />
            Drafts
            {drafts.length > 0 && (
              <span className="ml-auto text-[10px] bg-[#222] text-zinc-400 px-1.5 py-0.5 rounded">{drafts.length}</span>
            )}
          </button>
          <button
            onClick={() => setHistoryOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <ClockIcon className="w-3.5 h-3.5" />
            History
            {history.length > 0 && (
              <span className="ml-auto text-[10px] bg-[#222] text-zinc-400 px-1.5 py-0.5 rounded">{history.length}</span>
            )}
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </aside>

      {/* Right Content Area */}
      <main className="ml-[260px] flex-1 p-8 min-h-screen">
        {hasGenerated ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
            <PlatformCard
              platform="facebook"
              content={facebook}
              onContentChange={setFacebook}
              onPost={() => handlePost("facebook")}
              onSaveDraft={() => handleSaveDraft("facebook")}
              isPosting={postingFb}
              isConnected={fbConnected}
              imagePrompt={fbImagePrompt}
              imagePromptLoading={fbImgLoading}
              onGenerateImagePrompt={() => handleGenerateImagePrompt("facebook")}
            />
            <PlatformCard
              platform="instagram"
              content={instagram}
              onContentChange={setInstagram}
              onPost={() => handlePost("instagram")}
              onSaveDraft={() => handleSaveDraft("instagram")}
              isPosting={postingIg}
              isConnected={igConnected}
              imagePrompt={igImagePrompt}
              imagePromptLoading={igImgLoading}
              onGenerateImagePrompt={() => handleGenerateImagePrompt("instagram")}
            />
            <PlatformCard
              platform="linkedin"
              content={linkedin}
              onContentChange={setLinkedin}
              onPost={() => handlePost("linkedin")}
              onSaveDraft={() => handleSaveDraft("linkedin")}
              isPosting={postingLi}
              isConnected={liConnected}
              imagePrompt={liImagePrompt}
              imagePromptLoading={liImgLoading}
              onGenerateImagePrompt={() => handleGenerateImagePrompt("linkedin")}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#141414] border border-[#222] flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-600">
                Fill in the sidebar and click <span className="text-white font-medium">Generate</span> to create content.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Panels & Modals */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSaveCredentials}
        credentials={credentials}
      />
      <DraftsPanel
        isOpen={draftsOpen}
        onClose={() => setDraftsOpen(false)}
        drafts={drafts}
        onRemoveDraft={handleRemoveDraft}
        onPostAllDrafts={handlePostAllDrafts}
        postingAll={postingAllDrafts}
      />
      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
