import { useState, useEffect } from 'react';
import { Trophy, Clock, MousePointerClick, Calendar, Globe, Zap } from 'lucide-react';
import { useTranslation } from '../i18n';
import { getLeaderboardStats, getLeaderboard } from '../services/apiService';

export default function Leaderboard({ leaderboard: currentRoundLeaderboard, currentPlayerId }) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('round'); // round, day, week, all
  const [statsLeaderboard, setStatsLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      // If we're on the round tab and have a prop, just use that
      if (activeTab === 'round' && currentRoundLeaderboard) {
        setStatsLeaderboard(currentRoundLeaderboard);
        return;
      }

      // Otherwise, fetch from API
      if (activeTab === 'round' || statsLeaderboard.length === 0 || activeTab !== 'round') {
        if (activeTab !== 'round') setLoading(true); // Don't show full loading for background poll
        
        try {
          const data = activeTab === 'round' 
            ? await getLeaderboard() 
            : await getLeaderboardStats(activeTab);
            
          if (active) setStatsLeaderboard(data.leaderboard);
        } catch (err) {
          console.error("Failed to fetch leaderboard", err);
        } finally {
          if (active) setLoading(false);
        }
      }
    };

    fetchData();
    
    // Poll for the current round tab if we don't have a prop
    let interval;
    if (activeTab === 'round' && !currentRoundLeaderboard) {
      interval = setInterval(fetchData, 5000);
    }
    
    return () => { 
      active = false; 
      if (interval) clearInterval(interval);
    };
  }, [activeTab, currentRoundLeaderboard]);

  const displayData = statsLeaderboard;

  const tabs = [
    { id: 'round', label: t('round_tab'), icon: Zap },
    { id: 'day', label: t('day'), icon: Clock },
    { id: 'week', label: t('week'), icon: Calendar },
    { id: 'all', label: t('all_time'), icon: Globe },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden h-full flex flex-col">
      <div className="bg-slate-800 text-white p-6 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-lg leading-tight uppercase tracking-tight">{t('leaderboard')}</h3>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2 px-1 rounded-lg transition-all duration-200 ${
                activeTab === tab.id 
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <tab.icon className={`w-4 h-4 mb-1 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center h-full">
            <div className="w-8 h-8 border-3 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-3"></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('loading')}...</p>
          </div>
        ) : displayData.length === 0 ? (
          <div className="p-10 text-center flex items-center justify-center h-full">
            <p className="text-slate-400 font-medium italic">{t('no_scores')}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {displayData.map((score, index) => {
              const isCurrent = score.player_id === currentPlayerId;
              
              return (
                <div 
                  key={activeTab === 'round' ? score.id : `stats-${score.player_id}`} 
                  className={`flex items-center justify-between p-4 border-b border-slate-50 last:border-0 transition-all ${
                    isCurrent ? 'bg-primary-50/50 border-l-4 border-l-primary-500' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      index === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      index === 2 ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      'bg-slate-50 text-slate-400'
                    }`}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <p className={`font-black tracking-tight ${score.finished ? 'text-slate-800' : 'text-slate-400'}`}>
                        {score.player?.name || t('player')} 
                        {isCurrent && <span className="text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-md ml-2 uppercase tracking-tighter">You</span>}
                      </p>
                      <div className="flex items-center text-[10px] text-slate-400 gap-3 mt-1 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3"/> {score.clicks}</span>
                        {score.finished && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {score.time_taken}s</span>
                        )}
                        {activeTab !== 'round' && score.rounds_played && (
                          <span className="text-primary-400 font-black">{score.rounds_played} rounds</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`block text-xl font-black tabular-nums ${score.finished ? 'text-primary-600' : 'text-slate-300'}`}>{score.score}</span>
                    <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-black -mt-1">{t('score')}</span>
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
