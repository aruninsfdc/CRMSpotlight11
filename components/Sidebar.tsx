
import React from 'react';

interface SidebarProps {
  updateCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ updateCount }) => {
  return (
    <aside className="w-64 flex-shrink-0 hidden xl:block h-screen sticky top-0 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="p-6">
        <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900 mb-2">Automated Crawl</h4>
          <p className="text-xs text-slate-500 leading-relaxed mb-3">
            Our AI scans the industry every 6 hours to find key shifts in the CRM landscape.
          </p>
          <div className="flex items-center space-x-2 text-indigo-600">
            <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold uppercase">{updateCount} Updates Loaded</span>
          </div>
        </div>

        <div className="mt-8">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">About Spotlight</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            CRM Spotlight tracks global CRM trends since Jan 6, 2025. It uses Gemini 3 Flash to verify sources and summarize key insights.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
