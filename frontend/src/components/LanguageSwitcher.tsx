import React from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  variant?: 'large' | 'small';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'small' }) => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (variant === 'large') {
    // 第一頁中間的大按鈕版本
    return (
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => changeLanguage('zh-TW')}
          className={`px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
            currentLanguage === 'zh-TW' || currentLanguage === 'zh'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          中文
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={`px-6 py-3 rounded-lg font-medium text-lg transition-all duration-200 ${
            currentLanguage === 'en'
              ? 'bg-primary-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
          }`}
        >
          English
        </button>
      </div>
    );
  }

  // 右上角的小按鈕版本
  return (
    <div className="flex items-center gap-1 text-sm">
      <button
        onClick={() => changeLanguage('zh-TW')}
        className={`px-2 py-1 rounded transition-all duration-200 ${
          currentLanguage === 'zh-TW' || currentLanguage === 'zh'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-primary-600'
        }`}
      >
        中文
      </button>
      <span className="text-gray-400">|</span>
      <button
        onClick={() => changeLanguage('en')}
        className={`px-2 py-1 rounded transition-all duration-200 ${
          currentLanguage === 'en'
            ? 'bg-primary-600 text-white'
            : 'text-gray-600 hover:text-primary-600'
        }`}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
