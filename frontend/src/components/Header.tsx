import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm border-b border-snow-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-snow-900">Snow Force Gear Rental</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className={`text-snow-600 hover:text-snow-900 px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === '/' ? 'font-bold underline' : ''}`}
            >
              <Home className="h-4 w-4 inline mr-1" />
              {t('header.home')}
            </Link>
            <LanguageSwitcher variant="small" />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 