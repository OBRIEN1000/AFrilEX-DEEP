import React, { useState, useEffect } from 'react';
import { Search, Globe2, Sparkles, Loader2, Info, Users, LibraryBig, Moon, Sun } from 'lucide-react';
import { searchAfricanLanguages } from './services/geminiService';
import { ResearchResult, AppState } from './types';
import SimilarityGraph from './components/SimilarityGraph';
import TranslationList from './components/TranslationList';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle Theme Class on Body/HTML
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setState(AppState.SEARCHING);
    setResult(null);
    setErrorMsg('');

    try {
      const data = await searchAfricanLanguages(query);
      setResult(data);
      setState(AppState.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setState(AppState.ERROR);
      setErrorMsg("Unable to retrieve linguistic records. Please verify your connection or API key.");
    }
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${isDarkMode ? 'dark bg-night-950 text-papyrus-100' : 'bg-papyrus-50 text-papyrus-900'} pb-20 selection:bg-egypt-blue/20 selection:text-egypt-blue`}>
      {/* Header */}
      <header className="bg-white/90 dark:bg-night-900/90 backdrop-blur-md border-b border-papyrus-200 dark:border-night-800 sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-papyrus-100 dark:bg-night-800 p-2 rounded-full text-egypt-blue transition-colors">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-wider text-papyrus-900 dark:text-papyrus-50">AfriLex <span className="text-egypt-clay">Deep -- V.1.0</span></h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center text-xs font-bold tracking-widest uppercase text-papyrus-500 dark:text-night-300 gap-4">
              <span>Diop-Obenga Framework</span>
              <span className="w-1 h-1 bg-papyrus-300 dark:bg-night-600 rounded-full"></span>
              <span>African Linguistics</span>
            </div>
            
            {/* Theme Toggle */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-papyrus-100 dark:bg-night-800 text-papyrus-600 dark:text-night-200 hover:bg-papyrus-200 dark:hover:bg-night-700 transition-all border border-transparent dark:border-night-700"
              title="Toggle Theme"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12 md:mt-20">
        
        {/* Search Section */}
        <section className="max-w-4xl mx-auto text-center mb-20">
          <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-papyrus-100 dark:bg-night-800 border border-papyrus-200 dark:border-night-700 text-papyrus-700 dark:text-night-200 text-xs font-semibold tracking-wide uppercase transition-colors">
            <LibraryBig size={14} />
            <span>Deep Etymological Research</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold text-papyrus-900 dark:text-white mb-8 leading-tight transition-colors">
            Trace the <span className="text-egypt-blue dark:text-egypt-teal">African Roots</span><br/>of Human Language
          </h2>
          <p className="text-lg md:text-xl text-papyrus-700 dark:text-night-200 mb-10 max-w-2xl mx-auto font-serif leading-relaxed transition-colors">
            Enter a concept to uncover deep cognates connecting 30+ indigenous languages, including <span className="font-bold text-egypt-clay">Ancient Egyptian</span> & <span className="font-bold text-egypt-clay">Coptic</span>.
          </p>

          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative group">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a root word (e.g., 'Water', 'Sun', 'Mother')"
                className="w-full pl-14 pr-20 py-5 rounded-xl border-2 border-papyrus-200 dark:border-night-700 bg-white/80 dark:bg-night-900/80 text-xl font-serif text-papyrus-900 dark:text-papyrus-50 shadow-sm focus:border-egypt-blue focus:ring-4 focus:ring-egypt-blue/10 transition-all outline-none placeholder:text-papyrus-300 dark:placeholder:text-night-400"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-papyrus-400 dark:text-night-400 group-focus-within:text-egypt-blue transition-colors w-6 h-6" />
              
              <button 
                type="submit" 
                disabled={state === AppState.SEARCHING}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-papyrus-900 dark:bg-egypt-blue text-papyrus-50 p-3 rounded-lg hover:bg-egypt-blue dark:hover:bg-egypt-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {state === AppState.SEARCHING ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </section>

        {/* Error State */}
        {state === AppState.ERROR && (
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-6 rounded-xl text-center text-red-800 dark:text-red-200 mb-10">
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Results Section */}
        {state === AppState.SUCCESS && result && (
          <div className="space-y-16 animate-fade-in-up">
            
            {/* Analysis Summary Card */}
            <div className="bg-white dark:bg-night-900 p-8 md:p-10 rounded-2xl border border-papyrus-200 dark:border-night-700 shadow-xl shadow-papyrus-200/50 dark:shadow-none relative overflow-hidden transition-colors">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-egypt-blue to-egypt-teal"></div>
              <div className="flex items-start gap-4">
                <div className="bg-papyrus-100 dark:bg-night-800 p-3 rounded-full hidden md:block">
                  <Info className="text-egypt-blue dark:text-egypt-teal w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-display font-bold mb-4 text-papyrus-900 dark:text-papyrus-50">
                    Linguistic Analysis: <span className="text-egypt-blue dark:text-egypt-teal">"{result.sourceWord}"</span>
                  </h3>
                  <p className="text-papyrus-800 dark:text-papyrus-200 leading-relaxed text-lg font-serif">
                    {result.linguisticAnalysis}
                  </p>
                  
                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="px-4 py-2 bg-papyrus-100 dark:bg-night-800 rounded text-sm font-bold text-papyrus-700 dark:text-night-200 border border-papyrus-200 dark:border-night-700">
                      {result.translations.length} Languages
                    </div>
                    <div className="px-4 py-2 bg-egypt-blue/10 dark:bg-egypt-blue/20 rounded text-sm font-bold text-egypt-blue dark:text-egypt-teal border border-egypt-blue/20 dark:border-egypt-blue/30">
                      Includes Ancient Egyptian & Coptic
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visualization */}
            <div className="bg-white dark:bg-night-900 rounded-2xl border border-papyrus-200 dark:border-night-700 shadow-lg p-1 transition-colors">
                 <div className="p-6 pb-2">
                   <h3 className="text-xl font-display font-bold text-papyrus-900 dark:text-papyrus-50">Phonetic Cognate Map</h3>
                   <p className="text-papyrus-600 dark:text-night-300 text-sm mt-1">Distance represents phonetic divergence. Colors represent similarity groups.</p>
                 </div>
                 <SimilarityGraph data={result.translations} sourceWord={result.sourceWord} isDarkMode={isDarkMode} />
            </div>

            {/* Detailed List */}
            <TranslationList translations={result.translations} isDarkMode={isDarkMode} />

          </div>
        )}

        {/* Empty/Intro State */}
        {state === AppState.IDLE && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20 opacity-80">
             <div className="bg-white dark:bg-night-900 p-8 rounded-xl border border-papyrus-100 dark:border-night-800 shadow-sm text-center group hover:border-papyrus-300 dark:hover:border-night-600 transition-all">
               <div className="w-14 h-14 bg-papyrus-50 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-5 text-egypt-blue dark:text-egypt-teal group-hover:scale-110 transition-transform">
                 <Globe2 size={28} />
               </div>
               <h3 className="font-display font-bold text-papyrus-900 dark:text-papyrus-50 mb-3 text-lg">Pan-African Scope</h3>
               <p className="text-papyrus-600 dark:text-night-300 leading-relaxed">Comprehensive coverage across Niger-Congo, Nilo-Saharan, Khoisan, and Afroasiatic families.</p>
             </div>
             <div className="bg-white dark:bg-night-900 p-8 rounded-xl border border-papyrus-100 dark:border-night-800 shadow-sm text-center group hover:border-papyrus-300 dark:hover:border-night-600 transition-all">
               <div className="w-14 h-14 bg-papyrus-50 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-5 text-egypt-clay group-hover:scale-110 transition-transform">
                 <LibraryBig size={28} />
               </div>
               <h3 className="font-display font-bold text-papyrus-900 dark:text-papyrus-50 mb-3 text-lg">Classical Alignment</h3>
               <p className="text-papyrus-600 dark:text-night-300 leading-relaxed">Explicitly includes <span className="font-semibold">Ancient Egyptian (Medu Neter)</span> and <span className="font-semibold">Coptic</span> as core African languages.</p>
             </div>
             <div className="bg-white dark:bg-night-900 p-8 rounded-xl border border-papyrus-100 dark:border-night-800 shadow-sm text-center group hover:border-papyrus-300 dark:hover:border-night-600 transition-all">
               <div className="w-14 h-14 bg-papyrus-50 dark:bg-night-800 rounded-full flex items-center justify-center mx-auto mb-5 text-egypt-teal group-hover:scale-110 transition-transform">
                 <Users size={28} />
               </div>
               <h3 className="font-display font-bold text-papyrus-900 dark:text-papyrus-50 mb-3 text-lg">Cognate Discovery</h3>
               <p className="text-papyrus-600 dark:text-night-300 leading-relaxed">Identify shared roots and phonetic shifts using advanced AI linguistic synthesis.</p>
             </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="mt-32 border-t border-papyrus-200 dark:border-night-800 bg-white/50 dark:bg-night-950/50 backdrop-blur-sm py-8 text-center transition-colors">
        <p className="text-papyrus-500 dark:text-night-400 font-display text-sm">AfriLex Deep Search &copy; {new Date().getFullYear()}</p>
        <p className="text-papyrus-400 dark:text-night-500 text-xs mt-2">Powered by Hakilia AI</p>
      </footer>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;