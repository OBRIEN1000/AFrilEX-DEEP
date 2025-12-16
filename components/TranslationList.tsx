import React, { useState } from 'react';
import { Translation } from '../types';
import { MapPin, BookOpen, Sparkles } from 'lucide-react';

interface TranslationListProps {
  translations: Translation[];
}

const TranslationList: React.FC<TranslationListProps> = ({ translations }) => {
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
           <h3 className="text-3xl font-display text-papyrus-900 tracking-wide">Lexical Database</h3>
           <p className="text-papyrus-700 text-sm mt-1">Exploring {translations.length} African languages</p>
        </div>
        <input 
          type="text" 
          placeholder="Filter languages..." 
          className="w-full md:w-64 px-4 py-2 rounded-lg border border-papyrus-300 bg-white/50 focus:outline-none focus:ring-2 focus:ring-papyrus-500 text-papyrus-900 placeholder-papyrus-400 font-serif"
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
                  ? 'bg-gradient-to-br from-papyrus-50 to-papyrus-100 border-egypt-blue/30 shadow-md ring-1 ring-egypt-blue/10' 
                  : 'bg-white/80 border-papyrus-200 hover:border-papyrus-400 hover:shadow-sm'
                }
              `}
            >
              {special && (
                <div className="absolute -top-2 -right-2 bg-egypt-blue text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles size={10} />
                  CLASSICAL
                </div>
              )}

              <div className="flex justify-between items-start mb-3">
                <span className={`
                  text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded
                  ${special ? 'bg-egypt-blue/10 text-egypt-blue' : 'bg-papyrus-100 text-papyrus-600'}
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
                <h4 className={`text-xl font-serif font-bold mb-1 ${special ? 'text-egypt-blue' : 'text-papyrus-900'}`}>
                  {t.translatedWord}
                </h4>
                <p className="text-sm text-papyrus-600 italic font-serif opacity-90">
                  /{t.pronunciation}/
                </p>
              </div>
              
              <div className="space-y-2 text-xs text-papyrus-700 border-t border-papyrus-200 pt-3">
                <div className="flex items-center gap-2">
                  <BookOpen size={12} className={special ? "text-egypt-clay" : "text-papyrus-500"} />
                  <span className="font-bold tracking-wide uppercase">{t.language}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={12} className="text-papyrus-400" />
                  <span>{t.region}</span>
                </div>
                {t.notes && (
                  <div className="mt-2 text-papyrus-600 leading-relaxed bg-papyrus-50 p-2 rounded">
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