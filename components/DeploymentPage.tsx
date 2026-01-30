import React, { useState, useEffect } from 'react';
import { DeploymentRecord, User } from '../types';
import { fetchDeployments, saveDeployment } from '../services/persistenceService';
import { analyzeDeploymentRisk } from '../services/geminiService';

interface DeploymentPageProps {
  user: User | null;
}

const DeploymentPage: React.FC<DeploymentPageProps> = ({ user }) => {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null);

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    const data = await fetchDeployments();
    setDeployments(data);
  };

  const simulateBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setRiskAnalysis(null);
    setLogs([]);
    
    const steps = [
      "Triggering .github/workflows/deploy.yml...",
      "GitHub Pages Runner: initializing...",
      "Analyzing latest commits with Gemini AI...",
      "Generating static build artifact...",
      "Committing build metadata to SQL Server...",
      "Pushing artifact to GitHub pages environment...",
      "srv581460.hstgr.cloud: deployment signal received.",
      "Live deployment successful."
    ];

    const mockCommits = [
      "chore: add GitHub Actions workflow",
      "fix: handle 404 routing on sub-pages",
      "feat: strictly filter invalid news URLs",
      "refactor: optimized SQL commit logic"
    ];

    try {
      setLogs(prev => [...prev, "> github-pages: workflow_dispatch triggered.", `> Reading ${mockCommits.length} commits.`]);
      setBuildStep(steps[0]);
      await new Promise(r => setTimeout(r, 1000));

      setBuildStep(steps[2]);
      const risk = await analyzeDeploymentRisk(mockCommits);
      setRiskAnalysis(risk);
      setLogs(prev => [...prev, `> AI Verification: ${risk.riskLevel} risk detected.`, `> ${risk.summary}`]);
      await new Promise(r => setTimeout(r, 1500));

      for (let i = 3; i < 6; i++) {
        setBuildStep(steps[i]);
        setLogs(prev => [...prev, `> ${steps[i]}`]);
        await new Promise(r => setTimeout(r, 800));
      }

      setBuildStep(steps[6]);
      const newDeployment: DeploymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        version: `v1.1.${deployments.length + 1}`,
        status: 'success',
        timestamp: new Date().toISOString(),
        deployedBy: user?.name || 'GitHub Actions',
        commit: 'main/0a1b2c',
        log: logs
      };

      await saveDeployment(newDeployment);
      setDeployments(prev => [newDeployment, ...prev]);
      setLogs(prev => [...prev, "> PROD environment updated. Site is live."]);
    } catch (err) {
      setLogs(prev => [...prev, "> ERROR: Workflow failed. Check GitHub Actions tab."]);
    } finally {
      setIsBuilding(false);
      setBuildStep('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Build & Deployment</h1>
          <p className="text-slate-500 font-medium">Automated CI/CD via GitHub Actions to GitHub Pages.</p>
        </div>
        
        {user?.isAdmin ? (
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Environment</div>
              <div className="text-sm font-bold text-emerald-600">github-pages</div>
            </div>
            <button 
              onClick={simulateBuild}
              disabled={isBuilding}
              className={`px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl transition-all flex items-center space-x-3 ${isBuilding ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95 shadow-indigo-100'}`}
            >
              {isBuilding ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              )}
              <span>{isBuilding ? 'Syncing...' : 'Push to Production'}</span>
            </button>
          </div>
        ) : (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold uppercase tracking-widest">
            Restricted to Spotlight Admins
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">GitHub Action Output</span>
              </div>
              {isBuilding && <span className="text-[10px] font-black text-indigo-400 animate-pulse uppercase">{buildStep}</span>}
            </div>
            <div className="p-6 h-[400px] overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  No active builds. Ready for dispatch.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex space-x-4">
                    <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('ERROR') ? 'text-red-400' : log.includes('AI') ? 'text-indigo-400' : ''}>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {riskAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Pre-flight Intelligence</h3>
                    <p className="text-xs text-slate-400 font-medium">Commit Analysis Complete</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  riskAnalysis.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  riskAnalysis.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {riskAnalysis.riskLevel} IMPACT
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-700 text-sm leading-relaxed font-medium">{riskAnalysis.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {riskAnalysis.concerns.map((c: string, i: number) => (
                    <div key={i} className="flex items-center space-x-2 text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Build History</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {deployments.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs italic">
                  History is empty.
                </div>
              ) : (
                deployments.map(d => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-indigo-600">{d.version}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 rounded">LIVE</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {new Date(d.timestamp).toLocaleString()} • {d.deployedBy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
            <h4 className="text-sm font-black uppercase tracking-widest mb-4">Host Details</h4>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold opacity-60 uppercase">SQL Server Instance</div>
                <div className="text-xs font-mono font-bold">srv581460.hstgr.cloud</div>
              </div>
              <div>
                <div className="text-[10px] font-bold opacity-60 uppercase">Public URL</div>
                <div className="text-xs font-mono font-bold truncate">crm-spotlight.github.io</div>
              </div>
              <div className="pt-2">
                <div className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold inline-block">
                  HTTPS ENABLED
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPage;