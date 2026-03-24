import { useState } from 'react';
import { User } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function UsernameModal({ onSubmit, lang = 'ar' }) {
  const { t } = useTranslation(lang);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    await onSubmit(name.trim());
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{t('enter_name')}</h2>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="..."
            className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100 outline-none transition-all text-xl mb-6 text-center font-bold placeholder:font-normal placeholder:text-slate-400"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg shadow-primary-500/30 disabled:opacity-70 disabled:shadow-none text-lg"
          >
            {loading ? t('loading') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
