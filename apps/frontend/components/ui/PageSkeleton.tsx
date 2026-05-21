export default function PageSkeleton() {
  return (
    <div className="w-full h-full space-y-8 animate-pulse p-2">
      {/* Header section skeleton */}
      <div className="flex flex-col space-y-2">
        <div className="h-8 bg-slate-800/60 rounded-xl w-1/4 max-w-[250px]" />
        <div className="h-4 bg-slate-800/40 rounded-lg w-1/3 max-w-[320px]" />
      </div>

      {/* Primary visual body cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-[450px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-6 bg-slate-800/60 rounded-lg w-2/3" />
            <div className="h-4 bg-slate-800/40 rounded-lg w-full" />
            <div className="h-4 bg-slate-800/40 rounded-lg w-5/6" />
          </div>
          <div className="h-10 bg-slate-800/50 rounded-xl w-32" />
        </div>

        <div className="h-[450px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="h-6 bg-slate-800/60 rounded-lg w-1/2" />
            <div className="space-y-3">
              <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
              <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
              <div className="h-12 bg-slate-800/40 rounded-xl w-full" />
            </div>
          </div>
          <div className="h-10 bg-slate-800/50 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
