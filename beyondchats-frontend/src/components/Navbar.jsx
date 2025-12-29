import { Layers, RefreshCw } from 'lucide-react';

export default function Navbar({ onFetchNew, isScraping }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-3 text-slate-900 font-black text-2xl">
        <div className="bg-blue-600 p-2 rounded-2xl text-white shadow-lg shadow-blue-200">
          <Layers size={22} />
        </div>
        BeyondChats <span className="text-blue-600 font-light italic text-xl">Refiner</span>
      </div>

      <button 
        onClick={onFetchNew}
        disabled={isScraping}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-bold transition-all disabled:opacity-50"
      >
        <RefreshCw size={18} className={isScraping ? "animate-spin" : ""} />
        {isScraping ? "Scraping..." : "Fetch New Articles"}
      </button>
    </nav>
  );
}