"use client";

import Link from "next/link";
import React from "react";

interface ActiveTextProps {
  text: string;
  className?: string;
}

export default function ActiveText({ text, className }: ActiveTextProps) {
  if (!text) return null;

  // regex to find @mentions and URLs
  const regex = /(@\w+)|(https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);

  return (
    <p className={className}>
      {text.split(/(@\w+|https?:\/\/[^\s]+)/g).map((part, i) => {
        if (part?.startsWith("@")) {
          const username = part.substring(1);
          return (
            <Link
              key={i}
              href={`/profile/${username}`}
              className="text-[#E5FF66] font-bold hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </Link>
          );
        } else if (part?.startsWith("http")) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </p>
  );
}
