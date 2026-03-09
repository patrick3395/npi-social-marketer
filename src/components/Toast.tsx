"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-emerald-600"
      : type === "error"
        ? "bg-red-600"
        : "bg-blue-600";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 ${bg} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up max-w-md`}
    >
      <span className="text-sm">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white text-lg leading-none"
      >
        &times;
      </button>
    </div>
  );
}
