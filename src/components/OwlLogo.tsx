import React from "react";

interface OwlLogoProps {
  className?: string;
  size?: number;
  pulse?: boolean;
  color?: string;
}

export default function OwlLogo({ className = "", size = 64, pulse = false, color = "text-purple-500" }: OwlLogoProps) {
  return (
    <div
      id="owl-logo-container"
      className={`relative flex items-center justify-center select-none ${className} ${pulse ? "animate-pulse" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg
        id="owl-svg"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-full h-full ${color}`}
      >
        {/* Head and body curves */}
        <path d="M20,30 C30,10 70,10 80,30" />
        <path d="M20,30 C15,40 15,70 30,85 C40,92 60,92 70,85 C85,70 85,40 80,30" />

        {/* Big Owl Eyes */}
        <circle cx="38" cy="45" r="14" strokeWidth="3" />
        <circle cx="62" cy="45" r="14" strokeWidth="3" />

        {/* Pupils (cute curved sleeping/smiling eyes or focused ones) */}
        <path d="M32,45 C35,48 41,48 44,45" strokeWidth="2.5" fill="none" />
        <path d="M56,45 C59,48 65,48 68,45" strokeWidth="2.5" fill="none" />

        {/* Small ears detail */}
        <path d="M20,30 L22,20 L35,26" />
        <path d="M80,30 L78,20 L65,26" />

        {/* Beak */}
        <polygon points="50,49 46,57 54,57" fill="currentColor" className="text-purple-600" />

        {/* Little feathers / detail on body */}
        <path d="M42,68 C45,70 50,70 50,68 C50,70 55,70 58,68" strokeWidth="2.5" />
        <path d="M38,76 C42,78 50,78 50,76 C50,78 58,78 62,76" strokeWidth="2" />

        {/* Little cute claws on branch */}
        <path d="M40,88 L40,94" strokeWidth="4" />
        <path d="M45,88 L45,94" strokeWidth="4" />
        <path d="M55,88 L55,94" strokeWidth="4" />
        <path d="M60,88 L60,94" strokeWidth="4" />
      </svg>
    </div>
  );
}
