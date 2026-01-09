
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

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'salesforce': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'hubspot': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'microsoft dynamics': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ai integration': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${getCategoryColor(item.category)}`}>
          {item.category}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          {formatTimeAgo(new Date(item.timestamp))}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors leading-tight">
        {item.title}
      </h3>
      
      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">
        {item.summary}
      </p>

      {insight && (
        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 rounded-xl relative animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="absolute -top-2 left-4 px-2 bg-indigo-600 text-[8px] font-black text-white rounded-full uppercase tracking-tighter">AI Market Insight</div>
          <p className="text-indigo-900 text-xs font-medium leading-relaxed italic">
            "{insight}"
          </p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <button 
          onClick={handleFetchInsight}
          disabled={loadingInsight}
          className={`flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg transition-all ${
            insight 
              ? 'bg-indigo-100 text-indigo-600' 
              : 'bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white'
          }`}
        >
          {loadingInsight ? (
            <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          <span>{insight ? 'Analyzed' : 'AI Insight'}</span>
        </button>
        
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 group/link transition-colors"
        >
          Source
          <svg className="ml-1.5 w-3.5 h-3.5 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
