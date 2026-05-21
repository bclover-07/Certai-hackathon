export default function IssuedLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
        <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="h-6 w-24 bg-slate-800/50 rounded-lg" />
                <div className="h-4 w-12 bg-slate-800/40 rounded" />
              </div>
              <div className="h-6 w-3/4 bg-slate-800/60 rounded" />
              <div className="h-4 w-1/2 bg-slate-800/50 rounded" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-slate-800/30 rounded" />
              <div className="h-3 w-5/6 bg-slate-800/30 rounded" />
            </div>
            <div className="h-10 bg-slate-800/40 rounded-xl w-full mt-4" />
          </div>
        ))}
      </div>
    </div>
  );
}
