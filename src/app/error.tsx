"use client";

import { useEffect } from "react";
import ErrorLayout from "@/components/ErrorLayout";
import { Sparkles } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or reporting service
    console.error("Runtime error caught by error.tsx:", error);
  }, [error]);

  return (
    <ErrorLayout
      statusCode="500"
      title="Physics Defied?"
      message="Something broke in our universe. We're on it, but you can try to refresh our synchronization."
      onRetry={() => reset()}
    >
      <div className="flex flex-col items-center gap-6 mt-12 opacity-30 group">
        <div className="w-16 h-16 rounded-[24px] bg-[#E5FF66] flex items-center justify-center border border-black/10 group-hover:rotate-12 transition-transform duration-500">
          <Sparkles size={32} strokeWidth={3} className="text-black" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.4em] leading-none">
            Report ID:
          </p>
          <code className="text-[10px] p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-400 font-mono select-all">
            {error.digest || 'univas-edge-fail'}
          </code>
        </div>
      </div>
    </ErrorLayout>
  );
}
