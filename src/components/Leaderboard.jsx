import { Trophy, Clock, MousePointerClick, Medal } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Leaderboard({ leaderboard, currentPlayerId, lang = 'ar' }) {
  const { t } = useTranslation(lang);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
      <div className="bg-slate-800 text-white p-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h3 className="font-bold text-lg">{t('leaderboard')}</h3>
      </div>
      
      <div className="p-0">
        {leaderboard.length === 0 ? (
          <p className="p-6 text-center text-slate-500 font-medium">{t('no_scores')}</p>
        ) : (
          <div className="flex flex-col">
            {leaderboard.map((score, index) => {
              const isCurrent = score.player_id === currentPlayerId;
              
              return (
                <div 
                  key={score.id} 
                  className={`flex items-center justify-between p-3 border-b border-slate-100 last:border-0 transition-colors ${isCurrent ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                      index === 2 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                      'bg-slate-50 text-slate-500'
                    }`}>
                      {index < 3 ? <Medal className="w-4 h-4" /> : `#${index + 1}`}
                    </div>
                    <div>
                      <p className={`font-bold ${score.finished ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {score.player?.name || t('player')} {isCurrent && <span className="text-xs font-normal text-primary-500 mx-1">({lang === 'ar' ? 'أنت' : 'You'})</span>}
                      </p>
                      <div className="flex items-center text-xs text-slate-500 gap-3 mt-1 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded"><MousePointerClick className="w-3 h-3"/> {score.clicks}</span>
                        {score.finished && (
                          <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3"/> {score.time_taken}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`${lang === 'ar' ? 'text-left' : 'text-right'} select-none`}>
                    <span className={`block text-xl font-black ${score.finished ? 'text-emerald-600' : 'text-slate-800'}`}>{score.score}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold -mt-1">{t('score')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
