import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Shuffle, Clock, MapPin, Target, ArrowRight } from 'lucide-react';
import UsernameModal from '../components/UsernameModal';
import Leaderboard from '../components/Leaderboard';
import { getCurrentRound, joinGame } from '../services/apiService';
import { getArticleImage } from '../services/wikipediaService';
import { useTranslation } from '../i18n';

export default function StartMenu() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [roundInfo, setRoundInfo] = useState(null);
  const [savedName, setSavedName] = useState(localStorage.getItem('wiki_player_name') || '');
  const [savedId, setSavedId] = useState(localStorage.getItem('wiki_player_id') || '');
  const [timeLeft, setTimeLeft] = useState(null);
  
  const [startImage, setStartImage] = useState(null);
  const [targetImage, setTargetImage] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const fetchRound = async () => {
      try {
        const data = await getCurrentRound();
        if (active) {
          setRoundInfo(data);
          setTimeLeft(data.time_remaining);
        }
      } catch (err) {
        console.error("Failed to fetch round", err);
      }
    };

    fetchRound();
    const interval = setInterval(fetchRound, 5000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (roundInfo?.round) {
      getArticleImage(roundInfo.round.start_page).then(setStartImage);
      getArticleImage(roundInfo.round.target_page).then(setTargetImage);
    } else {
      setStartImage(null);
      setTargetImage(null);
    }
  }, [roundInfo?.round?.start_page, roundInfo?.round?.target_page]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null;
        return prev > 0 ? prev - 1 : 0;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const initiateJoin = async () => {
    if (savedName && savedId) {
      setLoading(true);
      try {
        let finalRound = roundInfo;
        if (!finalRound || !finalRound.is_active) {
            finalRound = await getCurrentRound();
        }
        navigate('/play', { 
          state: { 
            roundId: finalRound.round.id,
            startTitle: finalRound.round.start_page, 
            targetTitle: finalRound.round.target_page,
            playerId: savedId
          } 
        });
      } catch (error) {
        console.error("Failed to start", error);
        alert("حدث خطأ أثناء تحميل اللعبة. تأكد أن الخادم يعمل.");
        setLoading(false);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wiki_player_name');
    localStorage.removeItem('wiki_player_id');
    setSavedName('');
    setSavedId('');
  };

  const handleJoin = async (name) => {
    setLoading(true);
    try {
      const { player } = await joinGame(name);
      localStorage.setItem('wiki_player_id', player.id);
      localStorage.setItem('wiki_player_name', player.name);
      
      let finalRound = roundInfo;
      if (!finalRound || !finalRound.is_active) {
          finalRound = await getCurrentRound();
      }

      setShowModal(false);
      navigate('/play', { 
        state: { 
          roundId: finalRound.round.id,
          startTitle: finalRound.round.start_page, 
          targetTitle: finalRound.round.target_page,
          playerId: player.id
        } 
      });
    } catch (error) {
      console.error("Failed to join game", error);
      alert("حدث خطأ أثناء تحميل اللعبة. تأكد أن الخادم يعمل.");
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 relative p-4 flex items-center justify-center overflow-hidden">
      {showModal && <UsernameModal onSubmit={handleJoin} />}
      
      <div className="w-full max-w-5xl h-full max-h-[850px] grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch py-4">
        {/* Left Side - Welcome & Current Round */}
        <div className="lg:col-span-1 bg-white p-6 md:p-10 rounded-2xl shadow-xl text-center border border-slate-100 flex flex-col justify-between relative z-10 overflow-hidden">
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-inner shrink-0">
            <BookOpen className="w-8 h-8 text-primary-600 -rotate-3" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 mb-2 tracking-tighter shrink-0">{t('app_title')}</h1>
          
          <p className="text-slate-500 mb-6 text-base md:text-lg leading-relaxed max-w-2xl mx-auto font-medium shrink-0">
            {t('intro_text')}
          </p>

          <div className="max-w-[90%] mx-auto">
            {savedName && (
              <div className="bg-slate-50/50 rounded-2xl p-5 mb-8 border border-slate-200/60 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                    <span className="text-lg">👋</span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 leading-none mb-1">Signed in as</p>
                    <p className="text-slate-800 font-black">{savedName}</p>
                  </div>
                </div>
                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="text-xs text-slate-400 hover:text-rose-500 font-black transition-colors uppercase tracking-widest opacity-0 group-hover:opacity-100"
                >
                  {t('change_name')}
                </button>
              </div>
            )}

            {roundInfo && roundInfo.is_active && (
              <div className="bg-white py-6 px-4 rounded-3xl mb-6 border border-slate-100 shadow-sm animate-in fade-in zoom-in duration-500 flex-grow flex flex-col justify-center min-h-0">
                <div className="flex items-center justify-center gap-1.5 mb-5 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">{t('active_round')}</span>
                  <div className="mx-2 h-4 w-px bg-slate-200"></div>
                  <Clock className={`w-3.5 h-3.5 ${timeLeft <= 30 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
                  <span className={`text-xs font-black tabular-nums ${timeLeft <= 30 ? 'text-rose-600' : 'text-slate-600'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 md:gap-6 w-full max-w-[98%] mx-auto relative min-h-0 flex-nowrap">
                  {/* Start Point */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <div className="w-16 h-16 md:w-24 md:h-24 aspect-square rounded-full overflow-hidden border-[3px] border-primary-500 shadow-md relative z-10 transition-transform hover:scale-105 duration-300 ring-4 ring-white shrink-0">
                      {startImage ? (
                        <img src={startImage} alt={roundInfo.round.start_page} className="w-full h-full object-cover block" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 font-bold text-xl">
                          {roundInfo.round.start_page.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <p className="text-[8px] md:text-[9px] uppercase tracking-wider font-bold text-primary-500 mb-0.5">{t('start_point')}</p>
                      <p className="font-black text-slate-800 leading-tight text-[10px] md:text-sm line-clamp-2">
                        {roundInfo.round.start_page}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center shrink-0 mb-6">
                    <div className="w-7 h-7 md:w-9 md:h-9 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 shadow-sm ring-2 ring-white">
                      <ArrowRight className="w-3.5 h-3.5 md:w-4 h-4" />
                    </div>
                  </div>

                  {/* Target Goal */}
                  <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                    <div className="w-16 h-16 md:w-24 md:h-24 aspect-square rounded-full overflow-hidden border-[3px] border-rose-500 shadow-md relative z-10 transition-transform hover:scale-105 duration-300 ring-4 ring-white shrink-0">
                      {targetImage ? (
                        <img src={targetImage} alt={roundInfo.round.target_page} className="w-full h-full object-cover block" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rose-100 text-rose-700 font-bold text-xl">
                          {roundInfo.round.target_page.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-center w-full">
                      <p className="text-[8px] md:text-[9px] uppercase tracking-wider font-bold text-rose-500 mb-0.5">{t('target_goal')}</p>
                      <p className="font-black text-slate-800 leading-tight text-[10px] md:text-sm line-clamp-2">
                        {roundInfo.round.target_page}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              onClick={initiateJoin}
              disabled={loading || (timeLeft !== null && timeLeft > 150)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-2xl shadow-primary-500/40 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:transform-none text-xl shrink-0"
            >
              {loading ? (
                <>
                  <Shuffle className="w-6 h-6 animate-spin" />
                  <span>{t('loading')}...</span>
                </>
              ) : (timeLeft !== null && timeLeft > 150) ? (
                <>
                  <Clock className="w-6 h-6 animate-pulse" />
                  <span>{t('starts_in')} {timeLeft - 150}s</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  <span>{t('play_now')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side - Leaderboard */}
        <div className="lg:col-span-1 lg:h-full">
          <Leaderboard currentPlayerId={savedId} />
        </div>
      </div>
    </div>
  );
}
