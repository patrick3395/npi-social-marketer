"use client";

import { useState, useEffect, useCallback } from "react";
import Select from "@/components/Select";
import PlatformCard from "@/components/PlatformCard";
import SettingsModal from "@/components/SettingsModal";
import Toast from "@/components/Toast";
import {
  SERVICES,
  MARKETS,
  GOALS,
  TONES,
  Credentials,
  DEFAULT_CREDENTIALS,
} from "@/lib/constants";

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

const CREDENTIALS_KEY = "npi-social-marketer-credentials";

function loadCredentials(): Credentials {
  if (typeof window === "undefined") return DEFAULT_CREDENTIALS;
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    return stored ? { ...DEFAULT_CREDENTIALS, ...JSON.parse(stored) } : DEFAULT_CREDENTIALS;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export default function Home() {
  const [service, setService] = useState(SERVICES[0]);
  const [market, setMarket] = useState(MARKETS[0]);
  const [goal, setGoal] = useState(GOALS[0]);
  const [tone, setTone] = useState(TONES[0]);

  const [generating, setGenerating] = useState(false);
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);

  const [postingFb, setPostingFb] = useState(false);
  const [postingIg, setPostingIg] = useState(false);
  const [postingLi, setPostingLi] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [credentials, setCredentials] = useState<Credentials>(DEFAULT_CREDENTIALS);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    setCredentials(loadCredentials());
  }, []);

  const saveCredentials = (creds: Credentials) => {
    setCredentials(creds);
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
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
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          market,
          goal,
          tone,
          anthropicApiKey: credentials.anthropicApiKey || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Generation failed");
      }
      const data = await res.json();
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

  const postToFacebook = async () => {
    setPostingFb(true);
    try {
      const res = await fetch("/api/post/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: facebook,
          pageAccessToken: credentials.metaPageAccessToken,
          pageId: credentials.facebookPageId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Post failed" }));
        throw new Error(err.error || "Facebook post failed");
      }
      showToast("Posted to Facebook!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Facebook post failed";
      showToast(msg, "error");
    } finally {
      setPostingFb(false);
    }
  };

  const postToInstagram = async () => {
    setPostingIg(true);
    try {
      const res = await fetch("/api/post/instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: instagram,
          pageAccessToken: credentials.metaPageAccessToken,
          igAccountId: credentials.instagramAccountId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Post failed" }));
        throw new Error(err.error || "Instagram post failed");
      }
      showToast("Posted to Instagram!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Instagram post failed";
      showToast(msg, "error");
    } finally {
      setPostingIg(false);
    }
  };

  const postToLinkedin = async () => {
    setPostingLi(true);
    try {
      const res = await fetch("/api/post/linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: linkedin,
          accessToken: credentials.linkedinAccessToken,
          organizationId: credentials.linkedinOrganizationId,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Post failed" }));
        throw new Error(err.error || "LinkedIn post failed");
      }
      showToast("Posted to LinkedIn!", "success");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "LinkedIn post failed";
      showToast(msg, "error");
    } finally {
      setPostingLi(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-npi-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">NPI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Social Marketer
              </h1>
              <p className="text-xs text-gray-500">
                Noble Property Inspections
              </p>
            </div>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Select label="Service" value={service} onChange={(v) => setService(v as typeof service)} options={SERVICES} />
            <Select label="Market" value={market} onChange={(v) => setMarket(v as typeof market)} options={MARKETS} />
            <Select label="Goal" value={goal} onChange={(v) => setGoal(v as typeof goal)} options={GOALS} />
            <Select label="Tone" value={tone} onChange={(v) => setTone(v as typeof tone)} options={TONES} />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full sm:w-auto px-8 py-3 bg-npi-blue text-white font-semibold rounded-lg hover:bg-npi-blue-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {generating ? "Generating..." : "Generate Content"}
          </button>
        </div>

        {/* Platform Cards */}
        {hasGenerated && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <PlatformCard
              platform="facebook"
              content={facebook}
              onContentChange={setFacebook}
              onPost={postToFacebook}
              isPosting={postingFb}
              isConnected={fbConnected}
            />
            <PlatformCard
              platform="instagram"
              content={instagram}
              onContentChange={setInstagram}
              onPost={postToInstagram}
              isPosting={postingIg}
              isConnected={igConnected}
            />
            <PlatformCard
              platform="linkedin"
              content={linkedin}
              onContentChange={setLinkedin}
              onPost={postToLinkedin}
              isPosting={postingLi}
              isConnected={liConnected}
            />
          </div>
        )}

        {!hasGenerated && (
          <div className="text-center py-16 text-gray-400">
            <svg className="mx-auto w-12 h-12 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            <p className="text-sm">
              Select your options above and click{" "}
              <span className="font-medium text-npi-blue">Generate Content</span>{" "}
              to create platform-specific social media posts.
            </p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={saveCredentials}
        credentials={credentials}
      />

      {/* Toast */}
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
