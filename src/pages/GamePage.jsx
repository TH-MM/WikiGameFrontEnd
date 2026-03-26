import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import Header from '../components/Header';
import Stats from '../components/Stats';
import ArticleViewer from '../components/ArticleViewer';
import Leaderboard from '../components/Leaderboard';
import { getArticleContent } from '../services/wikipediaService';
import { updateProgress, getLeaderboard } from '../services/apiService';
import { Trophy, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function GamePage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth & Round state
  const roundId = location.state?.roundId;
  const startTitle = location.state?.startTitle;
  const targetTitle = location.state?.targetTitle;
  const playerId = location.state?.playerId;
  const language = location.state?.language || 'ar';
  const { t } = useTranslation(language);
  
  const [currentTitle, setCurrentTitle] = useState(startTitle);
  const [articleHtml, setArticleHtml] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Game metrics
  const [clicks, setClicks] = useState(0);
  const [hasWon, setHasWon] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);
  const [globalTimeLeft, setGlobalTimeLeft] = useState(165);
  const [isPrepPhase, setIsPrepPhase] = useState(false);
  const [roundGenre, setRoundGenre] = useState(null); // Keep for legacy if needed, but we'll use below
  const [startGenre, setStartGenre] = useState(null);
  const [targetGenre, setTargetGenre] = useState(null);
  
  // Multiplayer
  const [leaderboard, setLeaderboard] = useState([]);

  // If accessed directly without state, go back
  if (!roundId || !startTitle || !targetTitle || !playerId) {
    return <Navigate to="/" replace />;
  }

  // Polling Leaderboard & Time
  useEffect(() => {
    let active = true;
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard(language);
        if (!active) return;
        
        setLeaderboard(data.leaderboard);
        setGlobalTimeLeft(data.time_remaining);
        setStartGenre(data.start_genre);
        setTargetGenre(data.target_genre);
        
        const inPrep = data.time_remaining > 150;
        setIsPrepPhase(inPrep);

        if (inPrep) {
          navigate('/');
          return;
        }
        
        if (!data.is_active || data.time_remaining <= 0) {
          setRoundEnded(true);
        }
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
      }
    };

    fetchLeaderboard(); // Initial fetch
    const interval = setInterval(fetchLeaderboard, 2000);
    return () => { active = false; clearInterval(interval); };
  }, [roundId]);

  // Handle auto-return to home when round ends and player didn't reach the target
  useEffect(() => {
    if (roundEnded && !hasWon) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [roundEnded, hasWon, navigate]);

  // Load article effect
  useEffect(() => {
    let active = true;
    const loadArticle = async () => {
      if (!active || roundEnded) return;
      setLoading(true);
      setError(null);
      
      // Fast-check win condition before loading if it's identical
      const normalizeTitle = (t) => decodeURIComponent(t).replace(/_/g, ' ').trim().toLowerCase();
      
      if (normalizeTitle(currentTitle) === normalizeTitle(targetTitle)) {
        setHasWon(true);
        setLoading(false);
        // Sync win to server
        updateProgress({ player_id: playerId, round_id: roundId, clicks, finished: true }).catch(console.error);
        return;
      }

      try {
        const article = await getArticleContent(currentTitle, language);
        if (!active) return;

        // If Wikipedia redirected us to the target title
        if (normalizeTitle(article.title) === normalizeTitle(targetTitle)) {
          setCurrentTitle(article.title);
          setHasWon(true);
          setLoading(false);
          updateProgress({ player_id: playerId, round_id: roundId, clicks, finished: true }).catch(console.error);
          return;
        }

        // Update title to the canonical one (in case of subtle changes or redirects)
        if (article.title !== currentTitle) {
          setCurrentTitle(article.title);
        }

        setArticleHtml(article.html);
      } catch (err) {
        console.error(err);
        if (!active) return;
        setError("فشل في تحميل المقالة. قد يكون الرابط معطوباً أو غير موجود.");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (currentTitle && !hasWon && !roundEnded && !isPrepPhase) {
      loadArticle();
    }
    
    return () => { active = false; };
  }, [currentTitle, targetTitle, hasWon, roundEnded, playerId, roundId, clicks]);

  const handleInternalLinkClick = (newTitle) => {
    if (hasWon || loading || roundEnded) return;
    
    setHistory(prev => [...prev, currentTitle]);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    setCurrentTitle(newTitle);
    
    // Sync progress in background
    updateProgress({ player_id: playerId, round_id: roundId, clicks: newClicks, finished: false }).catch(console.error);
  };

  const handleGoBack = () => {
    if (history.length === 0 || hasWon || loading || roundEnded) return;
    
    const newHistory = [...history];
    const previousTitle = newHistory.pop();
    
    setHistory(newHistory);
    
    const newClicks = clicks + 1;
    setClicks(newClicks);
    setCurrentTitle(previousTitle);
    
    // Sync progress in background
    updateProgress({ player_id: playerId, round_id: roundId, clicks: newClicks, finished: false }).catch(console.error);
  };

  const handleRestart = () => {
    navigate('/');
  };

  const isGameOver = hasWon || roundEnded;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow w-[90%] max-w-none mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        
        {/* Left/Main Column - Game Screen */}
        <div className="xl:col-span-3 w-full">
            <Stats 
              currentTitle={currentTitle} 
              targetTitle={targetTitle} 
              clicks={clicks} 
              timeElapsed={globalTimeLeft} 
              history={history}
              onGoBack={handleGoBack}
              lang={language}
              startGenre={startGenre}
              targetGenre={targetGenre}
            />

          {isGameOver ? (
            <div className="bg-white rounded-xl shadow-lg border border-primary-200 p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${hasWon ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                {hasWon ? <Trophy className="w-12 h-12 text-emerald-600" /> : <Clock className="w-12 h-12 text-slate-500" />}
              </div>
              <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                {hasWon ? t('win_title') : t('lost_title')}
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                {hasWon ? t('win_desc') : t('lost_desc')}
              </p>
              
              <button 
                onClick={handleRestart}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-primary-500/30 text-lg"
              >
                <RefreshCw className="w-5 h-5" />
                <span>{t('play_again')}</span>
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl mb-6 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-slate-500 text-lg">{t('loading')}...</p>
                </div>
              ) : (
                articleHtml && <ArticleViewer 
                  title={currentTitle}
                  htmlContent={articleHtml} 
                  onInternalLinkClick={handleInternalLinkClick} 
                />
              )}
            </>
          )}
        </div>

        {/* Right Column - Leaderboard */}
        <div className="xl:col-span-1 w-full">
          <Leaderboard 
            leaderboard={leaderboard} 
            currentPlayerId={playerId} 
            lang={language}
          />
        </div>

      </main>
    </div>
  );
}
