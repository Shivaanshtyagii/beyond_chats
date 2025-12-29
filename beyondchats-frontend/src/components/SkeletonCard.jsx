export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 h-[450px] animate-pulse">
      <div className="h-4 w-24 bg-slate-100 rounded-full mb-6"></div>
      <div className="h-8 w-full bg-slate-100 rounded-xl mb-4"></div>
      <div className="h-4 w-full bg-slate-50 rounded-xl mb-2"></div>
      <div className="h-4 w-2/3 bg-slate-50 rounded-xl mb-12"></div>
      <div className="mt-auto h-12 w-full bg-slate-100 rounded-2xl mb-3"></div>
      <div className="h-12 w-full bg-slate-50 rounded-2xl"></div>
    </div>
  );
}