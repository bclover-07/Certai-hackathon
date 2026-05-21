export default function WorldLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center" style={{ background: '#030508' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase animate-pulse">
          Loading 3D World...
        </p>
      </div>
    </div>
  );
}
