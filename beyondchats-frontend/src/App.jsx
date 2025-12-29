import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import ArticleCard from './components/ArticleCard';
import SkeletonCard from './components/SkeletonCard';
import ArticleModal from './components/ArticleModal';

export default function App() {
  const [articles, setArticles] = useState([]); // Must stay an empty array
  const [loading, setLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  const navigate = useNavigate();

  // FIX: This fallback ensures it works even if your .env is broken
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

  const fetchArticles = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/articles`);
      
      // FIX: Only update if the data is a real list (array)
      if (Array.isArray(res.data)) {
        setArticles(res.data);
      } else {
        console.error("Backend sent something that isn't a list:", res.data);
      }
    } catch (err) {
      console.error("API Connection Failed:", err);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  const handleFetchNew = async () => {
    setIsScraping(true);
    try {
      await axios.get(`${API_BASE_URL}/api/scrape`);
      await fetchArticles(); 
    } catch (err) {
      console.error("Scrape failed:", err);
    } finally {
      setIsScraping(false);
    }
  };

  useEffect(() => { fetchArticles(true); }, []);

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
            // FIX: Add a simple check before mapping
            articles && Array.isArray(articles) && articles.map(article => (
              <ArticleCard 
                key={article._id} 
                article={article} 
                onRefineComplete={fetchArticles} 
              />
            ))
          )}
        </div>
      </main>

      {/* FIX: Define all possible paths so the "No routes matched" warning goes away */}
      <Routes>
        <Route path="/" element={null} />
        <Route 
          path="/article/:id" 
          element={<ModalContainer articles={articles} onClose={() => navigate('/')} />} 
        />
      </Routes>
    </div>
  );
}

function ModalContainer({ articles, onClose }) {
  const { id } = useParams();
  const article = articles.find(a => a._id === id);
  if (!article) return null;
  return <ArticleModal article={article} onClose={onClose} />;
}