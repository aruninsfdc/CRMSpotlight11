import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import AboutPage from './components/AboutPage';
import ChatBot from './components/ChatBot';
import DeploymentPage from './components/DeploymentPage';
import { NewsItem, CRMCategory, User, AppView } from './types';
import { fetchCRMNews } from './services/geminiService';
import { getIntervalsSince } from './utils/dateUtils';
import { saveNewsToDatabase, checkDbConnection, fetchNewsFromDatabase } from './services/persistenceService';

const START_DATE = new Date('2025-01-06T00:00:00');
const CATEGORIES = ['All News', ...Object.values(CRMCategory)];

const App: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'connecting'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All News');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<User | null>(null);

  const handleManualRefresh = useCallback(async (isInitialBackfill = false) => {
    setRefreshing(true);
    setError(null);
    try {
      const searchStart = isInitialBackfill 
        ? '2025-01-06' 
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const newItems = await fetchCRMNews(searchStart, new Date().toISOString().split('T')[0]);
      
      if (newItems.length > 0) {
        const intervals = getIntervalsSince(START_DATE, 6);
        const hydrated = newItems.map((item, idx) => ({
          ...item,
          timestamp: intervals[idx % intervals.length].toISOString()
        }));

        await saveNewsToDatabase(hydrated);
        const updatedItems = await fetchNewsFromDatabase();
        setItems(updatedItems);
      } else if (isInitialBackfill) {
        setError("Crawl complete, but no new industry insights were found for this period.");
      }
    } catch (err: any) {
      console.error("Crawl failed", err);
      setError(err.message || "Failed to access AI research tools. Please try again later.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setDbStatus('connecting');
    setError(null);
    try {
      const isOk = await checkDbConnection();
      if (isOk) {
        setDbStatus('connected');
        const dbItems = await fetchNewsFromDatabase();
        
        if (dbItems.length === 0) {
          console.log("Database empty. Starting backfill from Jan 6...");
          await handleManualRefresh(true);
        } else {
          setItems(dbItems);
          setLoading(false);
        }
      } else {
        setDbStatus('error');
        setError("Could not connect to the cloud storage service.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("DB Load Error:", err);
      setDbStatus('error');
      setError('System integrity check failed. Connection to SQL Server timed out.');
      setLoading(false);
    }
  }, [handleManualRefresh]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSignIn = () => {
    setUser({
      name: "Spotlight Admin",
      email: "admin@crmspotlight.com",
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin${Math.floor(Math.random()*100)}`,
      isAdmin: true
    });
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === 'All News' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  const renderContent = () => {
    switch (currentView) {
      case 'deployment':
        return <DeploymentPage user={user} />;
      case 'about':
        return <AboutPage />;
      default:
        return (
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            {loading || (refreshing && items.length === 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse p-6">
                    <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
                    <div className="h-8 bg-slate-100 rounded w-3/4 mb-6"></div>
                    <div className="space-y-3">
                      <div className="h-3 bg-slate-50 rounded w-full"></div>
                      <div className="h-3 bg-slate-50 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{error}</h3>
                <p className="text-slate-500 text-sm max-w-md mb-8">
                  The intelligence system encountered a synchronization error. This usually happens when API limits are reached or the network is restricted.
                </p>
                <button 
                  onClick={loadData}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                >
                  Retry Connection
                </button>
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredItems.map(item => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-slate-400">
                <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <span className="font-bold text-sm">No data matching your filters</span>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      <Sidebar updateCount={items.length} />

      <main className="flex-grow flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => setCurrentView('home')}>
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 ring-4 ring-white transition-transform group-hover:scale-105">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tighter">
                    CRM<span className="text-indigo-600">Spotlight</span>
                  </h1>
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${dbStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`}></span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {dbStatus === 'connected' ? 'Cloud SQL Active' : 'System Offline'}
                    </span>
                  </div>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-6">
                {(['home', 'about', 'deployment'] as AppView[]).map((view) => (
                  <button 
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`text-sm font-bold capitalize transition-all ${currentView === view ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {view === 'deployment' ? 'Build & Deploy' : view}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {currentView === 'home' && (
                <div className="relative hidden lg:block">
                  <input
                    type="text"
                    placeholder="Filter news..."
                    className="w-64 pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              )}

              {user?.isAdmin && currentView === 'home' && (
                <button 
                  onClick={() => handleManualRefresh()}
                  disabled={refreshing}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black disabled:opacity-50 transition-all flex items-center space-x-2"
                >
                  {refreshing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : null}
                  <span>{refreshing ? 'Crawling...' : 'Scan Market'}</span>
                </button>
              )}

              {user ? (
                <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
                  <img src={user.photo} className="w-9 h-9 rounded-full border border-slate-200" alt="Admin" />
                  <button onClick={() => { setUser(null); setCurrentView('home'); }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors">LOGOUT</button>
                </div>
              ) : (
                <button onClick={handleSignIn} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Admin Login</button>
              )}
            </div>
          </div>

          {currentView === 'home' && (
            <div className="px-6 border-t border-slate-100 overflow-x-auto bg-slate-50/50">
              <nav className="flex space-x-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`py-3 border-b-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      activeCategory === cat ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </main>

      <ChatBot currentNews={items} />
    </div>
  );
};

export default App;