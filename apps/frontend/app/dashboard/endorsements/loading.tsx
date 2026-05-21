export default function EndorsementsLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[450px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="h-6 w-48 bg-slate-800/60 rounded" />
            <div className="space-y-3">
              <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
              <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
              <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
            </div>
          </div>
          <div className="h-10 bg-slate-800/40 rounded-xl w-full" />
        </div>

        <div className="h-[450px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-slate-800/60 rounded" />
            <div className="h-40 bg-slate-800/30 rounded-2xl w-full" />
          </div>
          <div className="h-10 bg-slate-800/50 rounded-xl w-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}
