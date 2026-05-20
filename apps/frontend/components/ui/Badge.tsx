import { CREDENTIAL_TYPE_COLORS, CREDENTIAL_TYPE_LABELS, CredentialType } from "../../lib/constants";

interface BadgeProps {
  type: CredentialType;
  className?: string;
}

export default function Badge({ type, className = "" }: BadgeProps) {
  const styles = CREDENTIAL_TYPE_COLORS[type] || {
    bg: "rgba(255, 255, 255, 0.05)",
    text: "#fff",
    border: "rgba(255, 255, 255, 0.1)",
  };

  const label = CREDENTIAL_TYPE_LABELS[type] || type;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide border border-solid transition-all duration-300 ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.text,
        borderColor: styles.border,
        boxShadow: `0 0 10px ${styles.bg}`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: styles.text }} />
      {label}
    </span>
  );
}
