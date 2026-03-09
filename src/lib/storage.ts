import { Credentials, DEFAULT_CREDENTIALS } from "./constants";

const CREDENTIALS_KEY = "npi-social-marketer-credentials";
const DRAFTS_KEY = "npi-social-marketer-drafts";
const HISTORY_KEY = "npi-social-marketer-history";

// --- Credentials ---
export function loadCredentials(): Credentials {
  if (typeof window === "undefined") return DEFAULT_CREDENTIALS;
  try {
    const stored = localStorage.getItem(CREDENTIALS_KEY);
    return stored ? { ...DEFAULT_CREDENTIALS, ...JSON.parse(stored) } : DEFAULT_CREDENTIALS;
  } catch {
    return DEFAULT_CREDENTIALS;
  }
}

export function saveCredentials(creds: Credentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
}

// --- Drafts ---
export interface Draft {
  id: string;
  platform: "facebook" | "instagram" | "linkedin";
  content: string;
  savedAt: string;
}

export function loadDrafts(): Draft[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(DRAFTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveDraft(platform: "facebook" | "instagram" | "linkedin", content: string): Draft {
  const drafts = loadDrafts();
  const draft: Draft = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    platform,
    content,
    savedAt: new Date().toISOString(),
  };
  drafts.unshift(draft);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  return draft;
}

export function removeDraft(id: string): void {
  const drafts = loadDrafts().filter((d) => d.id !== id);
  localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}

export function clearDrafts(): void {
  localStorage.removeItem(DRAFTS_KEY);
}

// --- Post History ---
export interface HistoryEntry {
  id: string;
  platform: "facebook" | "instagram" | "linkedin";
  timestamp: string;
  preview: string;
  status: "success" | "error";
  postId?: string;
  error?: string;
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(
  platform: "facebook" | "instagram" | "linkedin",
  content: string,
  status: "success" | "error",
  postId?: string,
  error?: string
): HistoryEntry {
  const history = loadHistory();
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    platform,
    timestamp: new Date().toISOString(),
    preview: content.slice(0, 80),
    status,
    postId,
    error,
  };
  history.unshift(entry);
  // Keep last 100 entries
  if (history.length > 100) history.length = 100;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return entry;
}
