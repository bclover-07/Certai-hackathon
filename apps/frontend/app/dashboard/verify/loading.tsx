export default function VerifyLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-[400px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-slate-800/60 rounded" />
            <div className="h-12 bg-slate-800/30 rounded-xl w-full" />
            <div className="h-12 bg-slate-800/30 rounded-xl w-full" />
          </div>
          <div className="h-12 bg-slate-800/50 rounded-xl w-full" />
        </div>

        <div className="h-[400px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-6 w-40 bg-slate-800/60 rounded" />
            <div className="space-y-2 pt-4">
              <div className="h-4 bg-slate-800/40 rounded w-full" />
              <div className="h-4 bg-slate-800/40 rounded w-5/6" />
              <div className="h-4 bg-slate-800/40 rounded w-4/5" />
            </div>
          </div>
          <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
