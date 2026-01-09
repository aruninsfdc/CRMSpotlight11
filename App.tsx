
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import NewsCard from './components/NewsCard';
import AboutPage from './components/AboutPage';
import { NewsItem, CRMCategory, User, AppView } from './types';
import { fetchCRMNews } from './services/geminiService';
import { getIntervalsSince } from './utils/dateUtils';
import { saveNewsToDatabase, checkDbConnection } from './services/persistenceService';

const App: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('All News');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [user, setUser] = useState<User | null>(null);

  const START_DATE = new Date('2025-01-06T00:00:00');
  const categories = ['All News', ...Object.values(CRMCategory)];

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const intervals = getIntervalsSince(START_DATE, 6);
      const latestNews = await fetchCRMNews('2025-01-06', new Date().toISOString());
      
      if (latestNews.length === 0) {
        throw new Error("No valid news items with working links were found.");
      }

      const hydratedItems = latestNews.map((item, idx) => {
        const intervalTime = intervals[idx % intervals.length] || new Date();
        return {
          ...item,
          timestamp: intervalTime.toISOString()
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setItems(hydratedItems);
      
      // Check SQL Connection status
      const isConnected = await checkDbConnection();
      setDbConnected(isConnected);

    } catch (err: any) {
      console.error("Load data error:", err);
      setError(err.message || 'Failed to retrieve CRM spotlight updates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualRefresh = async () => {
    if (!user?.isAdmin) return;
    setRefreshing(true);
    try {
      const newItems = await fetchCRMNews(new Date().toISOString(), new Date().toISOString());
      if (newItems.length > 0) {
        // Persist new items to the SQL Database
        await saveNewsToDatabase(newItems);
        setItems(prev => [...newItems, ...prev]);
      }
    } catch (err) {
      console.error("Refresh or Persist failed", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignIn = () => {
    // Simulating Google SSO
    const mockUser: User = {
      name: "Admin User",
      email: "admin@crmspotlight.com",
      photo: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
      isAdmin: true
    };
    setUser(mockUser);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === 'All News' || item.category === activeCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.source.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchQuery]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar updateCount={items.length} />

      <main className="flex-grow flex flex-col min-w-0">
        {/* Main Sticky Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('home')}>
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-100">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">CRM Spotlight</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI & SQL Engine</p>
                    {dbConnected && (
                      <span className="flex items-center text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                        SQL CONNECTED
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <nav className="hidden md:flex items-center space-x-4">
                <button 
                  onClick={() => setCurrentView('home')}
                  className={`text-sm font-semibold transition-colors ${currentView === 'home' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentView('about')}
                  className={`text-sm font-semibold transition-colors ${currentView === 'about' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  About Us
                </button>
              </nav>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-4">
              {currentView === 'home' && (
                <div className="flex-grow max-w-xs relative hidden lg:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search news..."
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}

              {/* Admin-only Scan Now button */}
              {user?.isAdmin && currentView === 'home' && (
                <button 
                  onClick={handleManualRefresh}
                  disabled={refreshing || loading}
                  className="group flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-sm transition-all disabled:opacity-50 active:scale-95 border border-slate-700"
                >
                  {refreshing ? (
                    <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-indigo-400 group-hover:text-indigo-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  <span>{refreshing ? 'Syncing to SQL...' : 'Scan Now'}</span>
                </button>
              )}

              {/* Google Sign In UI */}
              {user ? (
                <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-bold text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                  <button onClick={handleSignOut} className="relative group focus:outline-none">
                    <img src={user.photo} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-500 transition-all" />
                    {user.isAdmin && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleSignIn}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 rounded-xl text-xs font-bold text-slate-700 bg-white transition-all shadow-sm active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}
            </div>
          </div>

          {/* Top Tabs Navigation - home only */}
          {currentView === 'home' && (
            <div className="px-6 border-t border-slate-100 overflow-x-auto scrollbar-hide bg-white/50 backdrop-blur-sm">
              <nav className="flex space-x-8 py-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-bold text-[11px] uppercase tracking-widest transition-all ${
                      activeCategory === cat
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-grow">
          {currentView === 'home' ? (
            <div className="p-6 md:p-8">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-xl p-6 h-64">
                      <div className="h-4 bg-slate-100 rounded w-1/4 mb-4"></div>
                      <div className="h-6 bg-slate-100 rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                      <div className="h-4 bg-slate-100 rounded w-5/6 mb-8"></div>
                      <div className="h-8 bg-slate-50 rounded w-full mt-auto"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Search Disrupted</h3>
                  <p className="text-slate-500 max-w-md mb-6">{error}</p>
                  <button 
                    onClick={loadData}
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Reconnect & Retry
                  </button>
                </div>
              ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                  {filteredItems.map(item => (
                    <NewsCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">No results found</h3>
                  <p className="text-slate-500">We couldn't find any news matching your criteria.</p>
                  <button 
                    onClick={() => {setSearchQuery(''); setActiveCategory('All News');}}
                    className="mt-4 text-indigo-600 font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <AboutPage />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
