export default function LeaderboardLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
      </div>

      <div className="h-[450px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="h-6 w-32 bg-slate-800/60 rounded" />
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 border-b border-slate-800/40 pb-4">
              <div className="h-4 bg-slate-800/50 rounded w-1/3" />
              <div className="h-4 bg-slate-800/50 rounded w-1/2" />
              <div className="h-4 bg-slate-800/50 rounded w-1/4" />
              <div className="h-4 bg-slate-800/50 rounded w-1/3" />
              <div className="h-4 bg-slate-800/50 rounded w-1/2" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-5 gap-4 items-center">
                <div className="h-4 bg-slate-800/40 rounded w-1/4" />
                <div className="h-6 bg-slate-800/40 rounded w-3/4" />
                <div className="h-4 bg-slate-800/40 rounded w-1/3" />
                <div className="h-4 bg-slate-800/40 rounded w-1/2" />
                <div className="h-4 bg-slate-800/40 rounded w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
