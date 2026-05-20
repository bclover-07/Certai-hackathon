"use client";

interface QuickClaimsProps {
  onSelect: (claimText: string) => void;
}

export default function QuickClaims({ onSelect }: QuickClaimsProps) {
  const suggestions = [
    {
      label: "🛡️ HIPAA Compliance",
      text: "I completed 12 hours of HIPAA Compliance Training at Memorial Health System.",
    },
    {
      label: "🫀 ACLS Certification",
      text: "I finished my 35-hour ACLS Certification training at General Hospital last week.",
    },
    {
      label: "🏫 Medical Degree",
      text: "I graduated with a Doctor of Medicine (M.D.) from Boston University School of Medicine after 200 hours of clinical study.",
    },
    {
      label: "🔬 Pediatric Fellowship",
      text: "I accomplished a 40-hour Pediatric Cardiology Fellowship residency at St. Jude Children's Research Hospital.",
    },
  ];

  return (
    <div className="space-y-2.5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Suggested Claims (Quick Test)
      </span>
      <div className="flex flex-wrap gap-2.5">
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(s.text)}
            className="rounded-xl bg-slate-900/60 border border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-200 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
