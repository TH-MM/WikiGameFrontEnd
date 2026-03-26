import { Clock, MousePointerClick, Target, MapPin, Undo2 } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Stats({ currentTitle, targetTitle, clicks, timeElapsed, history = [], onGoBack, lang = 'ar', startGenre, targetGenre }) {
  const { t } = useTranslation(lang);
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLowTime = timeElapsed <= 30;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {startGenre && (
          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[0.65rem] font-bold text-slate-500 shadow-sm animate-in fade-in slide-in-from-top-1">
            <MapPin className="w-3 h-3 text-primary-500" />
            <span>{t('genre')}: {t('genre_' + startGenre)}</span>
          </div>
        )}
        {targetGenre && (
          <div className="flex items-center gap-1.5 bg-primary-50 px-2 py-1 rounded-lg border border-primary-100 text-[0.65rem] font-bold text-primary-600 shadow-sm animate-in fade-in slide-in-from-top-1">
            <Target className="w-3 h-3 text-rose-500" />
            <span>{t('genre')}: {t('genre_' + targetGenre)}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Article */}
        <div className="flex items-start justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1">{t('current_page')}</p>
              <p className="font-bold text-slate-800 line-clamp-1" title={currentTitle}>{currentTitle || '...'}</p>
            </div>
          </div>
          {history.length > 0 && typeof onGoBack === 'function' && (
            <button 
              onClick={onGoBack} 
              className="flex items-center gap-1.5 text-[0.7rem] bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold py-1 px-2 rounded-md transition-colors shrink-0 shadow-sm"
              title={t('back')}
            >
              <Undo2 className="w-3 h-3" />
              {t('back')}
            </button>
          )}
        </div>

        {/* Target Article */}
        <div className="flex items-start gap-3 p-3 bg-primary-50 rounded-lg border border-primary-100">
          <Target className="w-5 h-5 text-rose-500 mt-0.5" />
          <div>
            <p className="text-xs text-primary-600 font-medium mb-1">{t('target')}</p>
            <p className="font-bold text-primary-900 line-clamp-1" title={targetTitle}>{targetTitle || '...'}</p>
          </div>
        </div>

        {/* Clicks */}
        <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 lg:justify-center">
          <MousePointerClick className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">{t('clicks')}</p>
            <p className="font-bold text-xl text-slate-800 leading-none">{clicks}</p>
          </div>
        </div>

        {/* Timer Left */}
        <div className={`flex items-start gap-3 p-3 rounded-lg border lg:justify-center transition-colors ${isLowTime ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-100'}`}>
          <Clock className={`w-5 h-5 mt-0.5 ${isLowTime ? 'text-rose-500 animate-pulse' : 'text-emerald-500'}`} />
          <div>
            <p className={`text-xs font-medium mb-1 ${isLowTime ? 'text-rose-600' : 'text-slate-500'}`}>{t('time_left')}</p>
            <p className={`font-bold text-xl leading-none ${isLowTime ? 'text-rose-700' : 'text-slate-800'}`}>{formatTime(timeElapsed)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
