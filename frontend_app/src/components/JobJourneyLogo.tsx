import React from "react";

interface JobJourneyLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  onClick?: () => void;
  titleClassName?: string;
  subtitleClassName?: string;
  /** Optional accent color override for the arrow stroke (Tailwind text- class), e.g. "text-indigo-600" */
  accentClassName?: string;
}

export function JobJourneyLogo({
  size = "md",
  showText = true,
  className = "",
  onClick,
  titleClassName,
  subtitleClassName,
  accentClassName = "text-indigo-600",
}: JobJourneyLogoProps) {
  const sizeConfig = {
    sm: { icon: 24, title: "text-base", subtitle: "text-xs" },
    md: { icon: 32, title: "text-lg", subtitle: "text-xs" },
    lg: { icon: 40, title: "text-xl", subtitle: "text-sm" },
  } as const;

  const config = sizeConfig[size];

  return (
    <div
      className={`flex items-center gap-3 ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Mark */}
      <div className="relative flex-shrink-0">
        <svg
          width={config.icon}
          height={config.icon}
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* soft gradient disc */}
          <defs>
            <linearGradient id="jjg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" />
              <stop offset="55%" stopColor="#A855F7" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>
            <linearGradient id="jjg2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <circle cx="20" cy="20" r="20" fill="url(#jjg1)" />

          {/* briefcase */}
          <rect x="10.5" y="17.5" width="19" height="14.5" rx="3" fill="url(#jjg2)" />
          <rect x="16" y="14" width="8" height="4" rx="1.2" fill="white" fillOpacity="0.9" />

          {/* upward journey arrow */}
          <path
            d="M13.5 25.5L19.8 19.2L24 23.4l4.2-4.2"
            className={accentClassName}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* spark */}
          <path
            d="M29.5 13.5 L31 12 M31 13.5 L29.5 12"
            stroke="#FFFFFF"
            strokeOpacity="0.9"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <span
            className={`${config.title} font-semibold ${titleClassName ?? "text-slate-900"} leading-tight`}
          >
            JobJourney
          </span>
          <span className={`${config.subtitle} ${subtitleClassName ?? "text-slate-500"} leading-tight`}>
            Your Career Assistant
          </span>
        </div>
      )}
    </div>
  );
}

// Compact monogram for tight spaces (unchanged API)
export function JobJourneyLogoCompact({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div className={`flex items-center justify-center ${className}`} onClick={onClick}>
      <svg width="28" height="28" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="jjc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="55%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill="url(#jjc)" />
        <text
          x="20"
          y="25"
          textAnchor="middle"
          className="fill-white"
          style={{ fontSize: 13, fontWeight: 800, fontFamily: "system-ui, -apple-system, Segoe UI" }}
        >
          JJ
        </text>
      </svg>
    </div>
  );
}
