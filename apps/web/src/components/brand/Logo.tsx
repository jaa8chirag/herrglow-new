import Link from "next/link";
import { cn } from "@herrglow/ui";

export interface LogoProps {
  variant?: "light" | "dark" | "mark";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  withLink?: boolean;
  showSubtitle?: boolean;
}

export function Logo({
  variant = "light",
  size = "md",
  className,
  withLink = true,
  showSubtitle = true,
}: LogoProps) {
  const isDark = variant === "dark";
  const isMark = variant === "mark";

  const sizeClasses = {
    sm: "h-8",
    md: "h-9 sm:h-10",
    lg: "h-12",
    xl: "h-16",
  }[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Heraldic Gold & Plum Monogram Seal */}
      <svg
        viewBox="0 0 64 64"
        className={cn("shrink-0 aspect-square", sizeClasses)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`hg-gold-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#FBF0D2" : "#EED596"} />
            <stop offset="35%" stopColor={isDark ? "#E5C378" : "#D4AF37"} />
            <stop offset="70%" stopColor={isDark ? "#D4AF37" : "#C59B27"} />
            <stop offset="100%" stopColor={isDark ? "#F3E2B8" : "#E6C875"} />
          </linearGradient>

          <linearGradient id={`hg-plum-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "#3D122F" : "#4A1538"} />
            <stop offset="100%" stopColor={isDark ? "#1E0716" : "#26091D"} />
          </linearGradient>
        </defs>

        {/* Outer Ring */}
        <circle
          cx="32"
          cy="32"
          r="30.5"
          stroke={`url(#hg-gold-${variant})`}
          strokeWidth="1.4"
          strokeDasharray="200"
          strokeLinecap="round"
        />
        {/* Inner Accent Ring */}
        <circle
          cx="32"
          cy="32"
          r="27.5"
          stroke={isDark ? "#E5C378" : "#EED596"}
          strokeWidth="0.75"
          strokeOpacity={isDark ? 0.6 : 0.45}
        />
        {/* Shield Fill */}
        <circle cx="32" cy="32" r="26" fill={`url(#hg-plum-${variant})`} />

        {/* 'H' Left Pillar */}
        <path
          d="M 21.5 19.5 L 25 19.5 C 24.2 21 24.2 23 24.2 25 L 24.2 38.5 C 24.2 41 24.2 42.5 25 44.5 L 21.5 44.5 M 23.8 31.5 L 32.5 31.5"
          stroke={`url(#hg-gold-${variant})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 'H' Right Pillar & 'G' Loop */}
        <path
          d="M 32 19.5 L 35.5 19.5 C 34.7 21 34.7 23 34.7 25 L 34.7 44.5 M 34.7 20 C 37 19.2 40 20.2 42 22.5 C 44.5 25.5 44.8 30.5 43.5 35 C 42 40.5 37.5 45 32 45 C 25.5 45 20.5 40 20.5 33 C 20.5 30 21.5 27.5 23 25"
          stroke={`url(#hg-gold-${variant})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* 'G' Crossbar */}
        <path
          d="M 34.5 35.5 L 42.5 35.5 L 42.5 40"
          stroke={`url(#hg-gold-${variant})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Radiance Sparkle */}
        <path
          d="M 46 16 Q 46 20 50 20 Q 46 20 46 24 Q 46 20 42 20 Q 46 20 46 16 Z"
          fill={`url(#hg-gold-${variant})`}
        />
        <circle cx="46" cy="20" r="1.2" fill="#FFFFFF" />
      </svg>

      {/* Typography Wordmark & Tagline (omitted if variant === 'mark') */}
      {!isMark && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              "font-serif font-bold tracking-tight flex items-baseline gap-0.5",
              size === "sm" && "text-xl",
              size === "md" && "text-[1.45rem] sm:text-[1.65rem]",
              size === "lg" && "text-2xl sm:text-3xl",
              size === "xl" && "text-3xl sm:text-4xl",
              isDark ? "text-ivory" : "text-plum-950"
            )}
          >
            HerrGlow
            {/* Signature Luminous Gold Sparkle Dot */}
            <span
              aria-hidden="true"
              className={cn(
                "inline-block ml-0.5 font-sans font-black",
                isDark ? "text-gold-300" : "text-gold-500"
              )}
            >
              ✦
            </span>
          </span>

          {showSubtitle && (
            <span
              className={cn(
                "text-[0.55rem] sm:text-[0.62rem] font-semibold uppercase tracking-[0.24em] mt-0.5",
                isDark ? "text-gold-300/90" : "text-gold-600"
              )}
            >
              Luxury Salon at Home
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link
        href="/"
        aria-label="HerrGlow Home"
        className="group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 rounded-xl transition-transform active:scale-[0.98]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
