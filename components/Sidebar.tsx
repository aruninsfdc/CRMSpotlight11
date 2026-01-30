
import React from 'react';

interface SidebarProps {
  updateCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({ updateCount }) => {
  return (
    <aside className="w-80 flex-shrink-0 hidden xl:flex flex-col h-screen sticky top-0 bg-white border-r border-zinc-200/60 overflow-y-auto overflow-x-hidden">
      <div className="p-10 flex-grow">
        <div className="mb-12">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-8">Intelligence Pulse</h4>
          
          <div className="space-y-6">
            <div className="p-6 bg-zinc-900 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
                <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-xs font-black text-zinc-400 mb-2 uppercase tracking-widest relative z-10">Scan Cycle</h4>
              <div className="text-3xl font-black mb-4 relative z-10">6<span className="text-zinc-500 text-lg">H</span></div>
              <div className="flex items-center space-x-2 text-indigo-400 relative z-10">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">{updateCount} Signals Verified</span>
              </div>
            </div>

            <div className="p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 shadow-sm">
              <h4 className="text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-widest">AI Engine</h4>
              <p className="text-[11px] text-zinc-600 font-bold leading-relaxed">
                Gemini 3 Flash performs deep verification across multiple global market providers.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-6">Mission</h4>
          <p className="text-[11px] text-zinc-500 font-medium leading-relaxed mb-8">
            Spotlight filters ecosystem noise and delivers actionable CRM intelligence for strategic decision-making.
          </p>
          
          <div className="flex items-center space-x-2 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">System Status: Optimal</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
