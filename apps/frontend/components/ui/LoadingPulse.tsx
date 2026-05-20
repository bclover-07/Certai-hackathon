interface LoadingPulseProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingPulse({
  className = "",
  size = "md",
}: LoadingPulseProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div className={`flex items-center justify-center p-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div
          className={`absolute animate-ping rounded-full bg-cyan-500/20 opacity-75 ${sizeClasses[size]}`}
        />
        {/* Middle pulsing ring */}
        <div
          className={`absolute animate-pulse rounded-full bg-purple-500/10 border border-purple-500/30 ${sizeClasses[size]}`}
        />
        {/* Inner solid glowing core */}
        <div
          className={`rounded-full bg-gradient-to-tr from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.5)] ${
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"
          }`}
        />
      </div>
    </div>
  );
}
