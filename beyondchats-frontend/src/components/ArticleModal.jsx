import ReactMarkdown from 'react-markdown';
import { X, History, Sparkles, ExternalLink } from 'lucide-react';

// Ensure "export default" is present right here:
export default function ArticleModal({ article, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-900">{article.title}</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Comparison: Phase 1 vs Phase 2</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X /></button>
        </div>

        <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
          {/* Phase 1: Original */}
          <div className="flex-1 overflow-y-auto p-8 border-r border-slate-100 bg-slate-50/30">
            <div className="flex items-center gap-2 mb-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              <History size={16} /> Raw Scraped Content
            </div>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{article.content}</div>
          </div>

          {/* Phase 2: Refined */}
          <div className="flex-1 overflow-y-auto p-8 bg-white">
            <div className="flex items-center gap-2 mb-6 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
              <Sparkles size={16} /> AI Refined (Gemini 2.5)
            </div>
            <div className="prose prose-sm prose-blue max-w-none">
              {article.updatedContent ? (
                <ReactMarkdown>{article.updatedContent}</ReactMarkdown>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-20">
                  Refinement not yet triggered.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with exactly 2 Research Links */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Research References</span>
             <div className="flex gap-3">
               {article.references && article.references.map((link, i) => (
                 <a 
                   key={i} 
                   href={link} 
                   target="_blank" 
                   rel="noreferrer" 
                   className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline bg-white border border-blue-100 px-3 py-1.5 rounded-lg shadow-sm"
                 >
                   <ExternalLink size={12} /> Source {i + 1}
                 </a>
               ))}
             </div>
          </div>
          <button 
            onClick={() => window.open(article.originalUrl, '_blank')}
            className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold text-xs hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
          >
            Visit Original Blog
          </button>
        </div>
      </div>
    </div>
  );
}