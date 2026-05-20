import { ButtonHTMLAttributes, ReactNode } from "react";

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "blue" | "purple" | "emerald" | "pink";
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function NeonButton({
  children,
  variant = "blue",
  fullWidth = false,
  isLoading = false,
  className = "",
  disabled,
  ...props
}: NeonButtonProps) {
  const variantStyles = {
    blue: "bg-cyan-500/10 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]",
    purple:
      "bg-purple-500/10 border-purple-400/40 text-purple-200 hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.15)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]",
    emerald:
      "bg-emerald-500/10 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/20 hover:border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)]",
    pink: "bg-pink-500/10 border-pink-400/40 text-pink-200 hover:bg-pink-500/20 hover:border-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.15)] hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center font-semibold tracking-wider rounded-xl border border-solid py-3 px-6 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${
        fullWidth ? "w-full" : ""
      } ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg
            className="animate-spin h-5 w-5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
