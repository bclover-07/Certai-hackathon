import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "emerald" | "pink" | "none";
  hoverable?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  glowColor = "none",
  hoverable = false,
}: GlassCardProps) {
  const glowClasses = {
    blue: "neon-glow border-cyan-500/20",
    purple: "neon-glow-purple border-purple-500/20",
    emerald: "neon-glow-emerald border-emerald-500/20",
    pink: "border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.1)]",
    none: "",
  };

  return (
    <div
      className={`glass-card ${hoverable ? "glass-card-hover" : ""} ${
        glowClasses[glowColor]
      } ${className}`}
    >
      {children}
    </div>
  );
}
