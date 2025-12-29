import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { Wand2, Columns2, CheckCircle, RefreshCw } from 'lucide-react';

export default function ArticleCard({ article, onRefineComplete }) {
  const [isRefining, setIsRefining] = useState(false);
  const navigate = useNavigate(); // 2. Initialize the navigate function

  const handleRefine = async (e) => {
    e.stopPropagation();
    setIsRefining(true);
    try {
      // Trigger individual refinement (Phase 2)
      await axios.post(`http://localhost:5001/api/articles/${article._id}/refine`);
      await onRefineComplete(); 
    } catch (err) {
      console.error("Refinement failed:", err);
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      <div className="flex-grow">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Source Blog</span>
          {article.isUpdated && (
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
              <CheckCircle size={12} /> Refined
            </span>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-4 leading-tight">{article.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-3 mb-6">{article.content}</p>
      </div>
      
      <div className="flex flex-col gap-3 mt-auto">
        <button 
          onClick={handleRefine}
          disabled={isRefining || article.isUpdated}
          className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all 
            ${article.isUpdated ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          {isRefining ? <RefreshCw size={16} className="animate-spin" /> : article.isUpdated ? <CheckCircle size={16} /> : <Wand2 size={16} />}
          {isRefining ? "Gemini is writing..." : article.isUpdated ? "AI Refinement Done" : "Refine with AI"}
        </button>

        {/* 3. Update this button to navigate to the article's unique URL */}
        <button 
          onClick={() => navigate(`/article/${article._id}`)}
          className="w-full py-3 border-2 border-slate-900 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white transition-all"
        >
          <Columns2 size={16} /> Compare Side-by-Side
        </button>
      </div>
    </div>
  );
}