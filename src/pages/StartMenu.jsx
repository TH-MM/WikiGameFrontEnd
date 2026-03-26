import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, Shuffle, Clock, MapPin, Target } from 'lucide-react';
import UsernameModal from '../components/UsernameModal';
import { getCurrentRound, joinGame } from '../services/apiService';
import { getArticleImage } from '../services/wikipediaService';
import { useTranslation } from '../i18n';

export default function StartMenu() {
  const [language, setLanguage] = useState(localStorage.getItem('wiki_player_lang') || 'ar');
  const { t } = useTranslation(language);
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
        const data = await getCurrentRound(language);
        if (active) {
          setRoundInfo(data);
          setTimeLeft(data.time_remaining);
        }
      } catch (err) {
        console.error("Failed to fetch round", err);
      }
    };

    fetchRound();
    const interval = setInterval(fetchRound, 3000);
    return () => { active = false; clearInterval(interval); };
  }, [language]);

  useEffect(() => {
    if (roundInfo?.round) {
      getArticleImage(roundInfo.round.start_page, language).then(setStartImage);
      getArticleImage(roundInfo.round.target_page, language).then(setTargetImage);
    } else {
      setStartImage(null);
      setTargetImage(null);
    }
  }, [roundInfo?.round, language]);

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
            playerId: savedId,
            language: language
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
          playerId: player.id,
          language: language
        } 
      });
    } catch (error) {
      console.error("Failed to join game", error);
      alert("حدث خطأ أثناء تحميل اللعبة. تأكد أن الخادم يعمل.");
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-slate-50 relative ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {showModal && <UsernameModal onSubmit={handleJoin} lang={language} />}
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border border-slate-100 relative z-10">
        <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-12 h-12 text-primary-600" />
        </div>
        
        <h1 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">{t('app_title')}</h1>
        
        <div className="flex items-center justify-center gap-1 mb-6 p-1.5 bg-slate-100 rounded-xl inline-flex mx-auto" dir="ltr">
          {[ 
            { id: 'en', label: 'English' },
            { id: 'fr', label: 'Français' },
            { id: 'ar', label: 'العربية' }
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => {
                setLanguage(lang.id);
                localStorage.setItem('wiki_player_lang', lang.id);
                setRoundInfo(null);
                setTimeLeft(null);
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all focus:outline-none ${language === lang.id ? 'bg-white shadow-sm text-primary-600 ring-1 ring-primary-100' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <p className="text-slate-600 mb-6 text-lg leading-relaxed">
          {t('intro_text')}
        </p>

        {savedName && (
          <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-200 shadow-sm animate-in fade-in duration-300">
            <p className="text-slate-700 font-bold mb-1">{t('welcome_back')} <span className="text-primary-600">{savedName}</span> 👋</p>
            <button 
              onClick={handleLogout}
              disabled={loading}
              className="text-sm text-slate-400 hover:text-rose-500 font-medium transition-colors"
            >
              {t('change_name')}
            </button>
          </div>
        )}

        {roundInfo && roundInfo.is_active && (
          <div className="bg-emerald-50 py-5 px-5 rounded-xl mb-6 border border-emerald-100 animate-in fade-in zoom-in duration-300">
            <div className="text-emerald-700 font-bold flex items-center justify-between gap-2 mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span>{t('active_round')}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm" dir="ltr">
                <Clock className={`w-4 h-4 ${timeLeft <= 30 ? 'text-rose-500 animate-pulse' : 'text-emerald-600'}`} />
                <span className={`font-black min-w-[3rem] text-center ${timeLeft <= 30 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
              {roundInfo.round.start_genre && (
                <div className="flex items-center gap-1.5 bg-emerald-100/50 text-emerald-800 px-3 py-1.5 rounded-xl text-[0.65rem] font-black border border-emerald-200/50 shadow-sm">
                  <MapPin className="w-3 h-3" />
                  <span>{t('genre')}: {t('genre_' + roundInfo.round.start_genre)}</span>
                </div>
              )}
              {roundInfo.round.target_genre && (
                <div className="flex items-center gap-1.5 bg-rose-100/50 text-rose-800 px-3 py-1.5 rounded-xl text-[0.65rem] font-black border border-rose-200/50 shadow-sm">
                  <Target className="w-3 h-3" />
                  <span>{t('genre')}: {t('genre_' + roundInfo.round.target_genre)}</span>
                </div>
              )}
            </div>
            
            <div className={`flex flex-col gap-3 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                {startImage ? (
                  <img src={startImage} alt={roundInfo.round.start_page} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-primary-50 text-primary-700 font-black text-xl rounded-lg border border-primary-100 shrink-0 shadow-inner">
                    {roundInfo.round.start_page.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 font-medium mb-1">{t('start_point')}</p>
                  <p className="font-bold text-slate-800 leading-snug">{roundInfo.round.start_page}</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 flex items-center gap-3 shadow-sm">
                {targetImage ? (
                  <img src={targetImage} alt={roundInfo.round.target_page} className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 shadow-sm" />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-rose-50 text-rose-700 font-black text-xl rounded-lg border border-rose-100 shrink-0 shadow-inner">
                    {roundInfo.round.target_page.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs text-rose-500 font-medium mb-1">{t('target_goal')}</p>
                  <p className="font-bold text-rose-900 leading-snug">{roundInfo.round.target_page}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={initiateJoin}
          disabled={loading || (timeLeft !== null && timeLeft > 150)}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary-500/30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed disabled:transform-none"
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
  );
}
