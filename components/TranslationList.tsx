import React, { useState } from 'react';
import { Translation } from '../types';
import { MapPin, BookOpen, Sparkles } from 'lucide-react';

interface TranslationListProps {
  translations: Translation[];
  isDarkMode?: boolean;
}

const TranslationList: React.FC<TranslationListProps> = ({ translations, isDarkMode = false }) => {
  const [filter, setFilter] = useState('');

  const filtered = translations.filter(t => 
    t.language.toLowerCase().includes(filter.toLowerCase()) || 
    t.family.toLowerCase().includes(filter.toLowerCase()) ||
    t.region.toLowerCase().includes(filter.toLowerCase())
  );

  const isSpecial = (lang: string) => {
    const l = lang.toLowerCase();
    return l.includes('egypt') || l.includes('coptic') || l.includes('kemetic');
  };

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
        <div>
           <h3 className="text-3xl font-display text-papyrus-900 dark:text-papyrus-50 tracking-wide transition-colors">Lexical Database</h3>
           <p className="text-papyrus-700 dark:text-night-300 text-sm mt-1 transition-colors">Exploring {translations.length} African languages</p>
        </div>
        <input 
          type="text" 
          placeholder="Filter languages..." 
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-papyrus-300 dark:border-night-600 bg-white/50 dark:bg-night-800/50 focus:outline-none focus:ring-2 focus:ring-papyrus-500 dark:focus:ring-night-500 text-papyrus-900 dark:text-papyrus-100 placeholder-papyrus-400 dark:placeholder-night-400 font-serif transition-colors"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.map((t, idx) => {
          const special = isSpecial(t.language);
          return (
            <div 
              key={`${t.language}-${idx}`} 
              className={`
                relative p-5 rounded-lg border transition-all duration-300 group
                ${special 
                  ? 'bg-gradient-to-br from-papyrus-50 to-papyrus-100 dark:from-night-800 dark:to-night-900 border-egypt-blue/30 dark:border-egypt-teal/30 shadow-md ring-1 ring-egypt-blue/10 dark:ring-egypt-teal/10' 
                  : 'bg-white/80 dark:bg-night-900/80 border-papyrus-200 dark:border-night-700 hover:border-papyrus-400 dark:hover:border-night-500 hover:shadow-sm'
                }
              `}
            >
              {special && (
                <div className="absolute -top-2 -right-2 bg-egypt-blue dark:bg-egypt-teal text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles size={10} />
                  CLASSICAL
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <span className={`
                  text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded transition-colors
                  ${special 
                    ? 'bg-egypt-blue/10 dark:bg-egypt-teal/10 text-egypt-blue dark:text-egypt-teal' 
                    : 'bg-papyrus-100 dark:bg-night-800 text-papyrus-600 dark:text-night-300'}
                `}>
                  {t.family}
                </span>
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: getColorForGroup(t.similarityGroup) }} 
                  title={`Phonetic Group ${t.similarityGroup}`}
                />
              </div>
              
              <div className="mb-4">
                <h4 className={`text-xl font-serif font-bold mb-1 transition-colors ${special ? 'text-egypt-blue dark:text-egypt-teal' : 'text-papyrus-900 dark:text-papyrus-100'}`}>
                  {t.translatedWord}
                </h4>
                <p className="text-sm text-papyrus-600 dark:text-night-400 italic font-serif opacity-90 transition-colors">
                  /{t.pronunciation}/
                </p>
              </div>
              
              <div className="space-y-2 text-xs text-papyrus-700 dark:text-night-300 border-t border-papyrus-200 dark:border-night-800 pt-3 transition-colors">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className={special ? "text-egypt-clay" : "text-papyrus-500 dark:text-night-500"} />
                  <span className="font-bold tracking-wide uppercase">{t.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-papyrus-400 dark:text-night-600" />
                  <span>{t.region}</span>
                </div>
                {t.notes && (
                  <div className="mt-2 text-papyrus-600 dark:text-night-300 leading-relaxed bg-papyrus-50 dark:bg-night-800 p-2 rounded transition-colors">
                    {t.notes}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper for color consistency
const getColorForGroup = (id: number) => {
  const colors = [
    '#c59a5b', // Gold
    '#9c4332', // Clay
    '#2a7f87', // Teal
    '#1e4d68', // Deep Blue
    '#6f5033', // Earth
    '#5a412c', // Dark Earth
    '#a87e45', // Bronze
    '#876238'  // Leather
  ];
  return colors[id % colors.length];
}

export default TranslationList;