
import React from 'react';
import { NewsItem } from '../types';
import { formatTimeAgo } from '../utils/dateUtils';

interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'salesforce': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'hubspot': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'microsoft dynamics': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ai integration': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getCategoryColor(item.category)}`}>
          {item.category}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          {formatTimeAgo(new Date(item.timestamp))}
        </span>
      </div>
      
      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
        {item.title}
      </h3>
      
      <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
        {item.summary}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
            {item.source.charAt(0)}
          </div>
          <span className="text-sm font-medium text-slate-500">{item.source}</span>
        </div>
        
        <a 
          href={item.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 group/link"
        >
          Read Full Story
          <svg className="ml-1 w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default NewsCard;
