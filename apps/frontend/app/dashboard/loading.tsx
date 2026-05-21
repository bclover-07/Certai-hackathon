export default function DashboardLoading() {
  return (
    <div className="w-full space-y-8 animate-pulse">
      {/* Skeleton header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="h-8 w-64 bg-slate-800/60 rounded-xl mb-2" />
          <div className="h-4 w-48 bg-slate-800/40 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-slate-800/50 rounded-xl" />
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-800/20 rounded-2xl border border-slate-800/40 p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="h-4 w-20 bg-slate-800/50 rounded" />
              <div className="h-8 w-8 bg-slate-800/60 rounded-lg" />
            </div>
            <div className="h-8 w-16 bg-slate-800/70 rounded-md" />
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[350px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6">
          <div className="h-6 w-32 bg-slate-800/60 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
            <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
            <div className="h-16 bg-slate-800/30 rounded-xl w-full" />
          </div>
        </div>
        <div className="h-[350px] bg-slate-800/20 rounded-3xl border border-slate-800/40 p-6 flex flex-col justify-between">
          <div>
            <div className="h-6 w-32 bg-slate-800/60 rounded mb-6" />
            <div className="h-40 bg-slate-800/30 rounded-2xl w-full" />
          </div>
          <div className="h-10 bg-slate-800/40 rounded-xl w-full" />
        </div>
      </div>
    </div>
  );
}
