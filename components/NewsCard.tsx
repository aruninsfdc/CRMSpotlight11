import React, { useState } from 'react';
import { NewsItem } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';
import { getMarketInsight } from '../services/geminiService';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const [insight, setInsight] = useState<string | null>(item.insight || null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const getBranding = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'salesforce': 
        return {
          bg: 'bg-blue-50 text-blue-600 border-blue-100',
          dot: 'bg-blue-500',
          gradient: 'from-blue-500/5 to-transparent'
        };
      case 'hubspot': 
        return {
          bg: 'bg-orange-50 text-orange-600 border-orange-100',
          dot: 'bg-orange-500',
          gradient: 'from-orange-500/5 to-transparent'
        };
      case 'microsoft dynamics': 
        return {
          bg: 'bg-violet-50 text-violet-600 border-violet-100',
          dot: 'bg-violet-500',
          gradient: 'from-violet-500/5 to-transparent'
        };
      case 'ai integration': 
        return {
          bg: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
          dot: 'bg-fuchsia-500',
          gradient: 'from-fuchsia-500/5 to-transparent'
        };
      default: 
        return {
          bg: 'bg-zinc-100 text-zinc-600 border-zinc-200',
          dot: 'bg-zinc-400',
          gradient: 'from-zinc-400/5 to-transparent'
        };
    }
  };

  const brand = getBranding(item.category);

  const handleFetchInsight = async () => {
    if (insight || loadingInsight) return;
    setLoadingInsight(true);
    try {
      const aiInsight = await getMarketInsight(item);
      setInsight(aiInsight);
    } catch (err) {
      setInsight("Market impact analysis currently unavailable.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-[2rem] border border-zinc-200/60 p-7 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full overflow-hidden">
      {/* Dynamic Background Pulse */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${brand.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
      
      <div className="flex justify-between items-center mb-5 relative z-10">
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-[10px] font-extrabold uppercase tracking-widest ${brand.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${brand.dot} animate-pulse`}></span>
          <span>{item.category}</span>
        </div>
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
          {formatTimeAgo(new Date(item.timestamp))}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-zinc-900 mb-3 group-hover:text-indigo-600 transition-colors leading-[1.3] relative z-10">
        {item.title}
      </h3>
      
      <p className="text-zinc-500 text-sm leading-relaxed mb-6 flex-grow relative z-10 font-medium opacity-80">
        {item.summary}
      </p>

      {insight && (
        <div className="mb-6 p-5 bg-zinc-900 text-white rounded-2xl relative animate-in fade-in zoom-in-95 duration-500 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">Market Intelligence</span>
          </div>
          <p className="text-zinc-200 text-xs font-medium leading-relaxed italic">
            "{insight}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-zinc-100 relative z-10">
        <button 
          onClick={handleFetchInsight}
          disabled={loadingInsight}
          className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all duration-300 ${
            insight 
              ? 'bg-zinc-100 text-zinc-900 cursor-default' 
              : 'bg-indigo-600 text-white hover:bg-zinc-900 shadow-lg shadow-indigo-100 hover:shadow-none'
          }`}
        >
          {loadingInsight ? (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : !insight && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <span>{insight ? 'Analysis Complete' : 'Get AI Insight'}</span>
        </button>
        
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-[10px] font-black text-zinc-400 hover:text-indigo-600 uppercase tracking-widest group/link transition-all"
        >
          <span>Source</span>
          <svg className="w-3 h-3 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NewsCard;