export default function ClaimLoading() {
  return (
    <div className="w-full h-full p-6 animate-pulse">
      {/* Skeleton header */}
      <div className="h-8 w-64 bg-slate-800/60 rounded-lg mb-2" />
      <div className="h-4 w-48 bg-slate-800/40 rounded mb-8" />
      
      {/* Skeleton chat area */}
      <div className="flex gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-slate-800/40 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-800/40 rounded w-3/4" />
          <div className="h-4 bg-slate-800/40 rounded w-1/2" />
          <div className="h-4 bg-slate-800/40 rounded w-2/3" />
        </div>
      </div>
      
      <div className="flex gap-4 justify-end mb-6">
        <div className="flex-1 space-y-2 flex flex-col items-end">
          <div className="h-4 bg-slate-800/40 rounded w-3/4" />
          <div className="h-4 bg-slate-800/40 rounded w-1/2" />
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-800/40 flex-shrink-0" />
      </div>

      {/* Skeleton input */}
      <div className="fixed bottom-6 left-0 right-0 px-6">
        <div className="h-14 bg-slate-800/30 rounded-xl max-w-7xl mx-auto border border-slate-800/40" />
      </div>
    </div>
  );
}
