import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import ArticleCard from './components/ArticleCard';
import SkeletonCard from './components/SkeletonCard';
import ArticleModal from './components/ArticleModal';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);

  // Fetch articles from the database
  const fetchArticles = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/api/articles');
      setArticles(res.data);
    } catch (err) {
      console.error("API Connection Failed:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Trigger Phase 1: Fetch 5 oldest articles
  const handleFetchNew = async () => {
    setIsScraping(true);
    try {
      await axios.get('http://localhost:5001/api/scrape');
      await fetchArticles(); // Refresh list after scraping
    } catch (err) {
      console.error("Scrape failed:", err);
    } finally {
      setIsScraping(false);
    }
  };

  useEffect(() => { fetchArticles(true); }, []);

  // Find the full article object for the modal based on ID
  const selectedArticle = articles.find(a => a._id === selectedArticleId);

  return (
    <div className="min-h-screen bg-[#F9FBFF] pb-20 font-sans">
      <Navbar onFetchNew={handleFetchNew} isScraping={isScraping} />
      
      <main className="max-w-7xl mx-auto px-8 mt-16">
        <div className="mb-12">
          <h2 className="text-5xl font-black text-slate-900 tracking-tight">
            Knowledge <span className="text-blue-600">Evolution.</span>
          </h2>
          <p className="text-slate-400 font-medium mt-2">Transforming raw blogs into technical insights with Gemini.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
          ) : (
            articles.map(article => (
              <ArticleCard 
                key={article._id} 
                article={article} 
                onOpen={() => setSelectedArticleId(article._id)}
                onRefineComplete={fetchArticles} 
              />
            ))
          )}
        </div>
      </main>

      {selectedArticle && (
        <ArticleModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticleId(null)} 
        />
      )}
    </div>
  );
}