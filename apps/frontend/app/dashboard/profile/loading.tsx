export default function ProfileLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="h-[350px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col items-center justify-between">
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="w-24 h-24 rounded-full bg-slate-800/40" />
            <div className="h-6 w-32 bg-slate-800/60 rounded" />
            <div className="h-4 w-48 bg-slate-800/50 rounded" />
          </div>
          <div className="h-10 bg-slate-800/40 rounded-xl w-full" />
        </div>

        <div className="md:col-span-2 h-[350px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-slate-800/60 rounded" />
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-3">
                <div className="h-4 w-24 bg-slate-800/50 rounded" />
                <div className="h-4 w-40 bg-slate-800/40 rounded" />
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/30 pb-3">
                <div className="h-4 w-24 bg-slate-800/50 rounded" />
                <div className="h-4 w-40 bg-slate-800/40 rounded" />
              </div>
              <div className="flex justify-between items-center pb-3">
                <div className="h-4 w-24 bg-slate-800/50 rounded" />
                <div className="h-4 w-40 bg-slate-800/40 rounded" />
              </div>
            </div>
          </div>
          <div className="h-10 bg-slate-800/50 rounded-xl w-32" />
        </div>
      </div>
    </div>
  );
}
