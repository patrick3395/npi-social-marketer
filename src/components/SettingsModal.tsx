"use client";

import { useState, useEffect } from "react";
import { Credentials, DEFAULT_CREDENTIALS } from "@/lib/constants";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (credentials: Credentials) => void;
  credentials: Credentials;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  credentials,
}: SettingsModalProps) {
  const [form, setForm] = useState<Credentials>(DEFAULT_CREDENTIALS);

  useEffect(() => {
    setForm(credentials);
  }, [credentials, isOpen]);

  if (!isOpen) return null;

  const set = (key: keyof Credentials, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const metaConnected = !!(form.metaPageAccessToken && form.facebookPageId);
  const igConnected = !!(form.metaPageAccessToken && form.instagramAccountId);
  const liConnected = !!(form.linkedinAccessToken && form.linkedinOrganizationId);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#141414] border border-[#222] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto dark-scrollbar">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222]">
          <h2 className="text-sm font-semibold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Anthropic */}
          <section>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Anthropic API
            </h3>
            <Field
              label="API Key"
              value={form.anthropicApiKey}
              onChange={(v) => set("anthropicApiKey", v)}
              placeholder="sk-ant-..."
              type="password"
            />
          </section>

          {/* Meta / Facebook / Instagram */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Meta (Facebook & Instagram)
              </h3>
              <StatusDot connected={metaConnected} label="FB" />
              <StatusDot connected={igConnected} label="IG" />
            </div>
            <div className="space-y-3">
              <Field
                label="Page Access Token"
                value={form.metaPageAccessToken}
                onChange={(v) => set("metaPageAccessToken", v)}
                placeholder="EAA..."
                type="password"
              />
              <Field
                label="Facebook Page ID"
                value={form.facebookPageId}
                onChange={(v) => set("facebookPageId", v)}
                placeholder="123456789"
              />
              <Field
                label="Instagram Business Account ID"
                value={form.instagramAccountId}
                onChange={(v) => set("instagramAccountId", v)}
                placeholder="17841..."
              />
            </div>
          </section>

          {/* LinkedIn */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">LinkedIn</h3>
              <StatusDot connected={liConnected} label="LI" />
            </div>
            <div className="space-y-3">
              <Field
                label="Access Token"
                value={form.linkedinAccessToken}
                onChange={(v) => set("linkedinAccessToken", v)}
                placeholder="AQV..."
                type="password"
              />
              <Field
                label="Organization ID"
                value={form.linkedinOrganizationId}
                onChange={(v) => set("linkedinOrganizationId", v)}
                placeholder="12345678"
              />
            </div>
          </section>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#222]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 border border-[#333] rounded-lg hover:text-white hover:border-zinc-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg hover:bg-white/20 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0a0a] border border-[#222] rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 placeholder-zinc-600"
      />
    </div>
  );
}

function StatusDot({
  connected,
  label,
}: {
  connected: boolean;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1 text-xs text-zinc-500">
      <span
        className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`}
      />
      {label}
    </span>
  );
}
