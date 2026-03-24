import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Header() {
  const lang = localStorage.getItem('wiki_player_lang') || 'ar';
  const { t } = useTranslation(lang);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10 border-b border-primary-100">
      <div className="w-[90%] max-w-none mx-auto px-4 py-3 flex justify-between items-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{t('app_title')}</h1>
        </Link>
      </div>
    </header>
  );
}
