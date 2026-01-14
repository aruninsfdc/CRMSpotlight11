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
      "Fetching latest commits from GitHub...",
      "Resolving dependencies...",
      "Analyzing code with Gemini AI...",
      "Running unit tests...",
      "Building production bundles...",
      "Optimizing assets...",
      "Deploying to srv581460.hstgr.cloud...",
      "Verification complete."
    ];

    const mockCommits = [
      "feat: add SQL Server persistence layer",
      "fix: blinking UI error in main App component",
      "feat: integrated Gemini 3 Pro chatbot",
      "chore: update build scripts for cloud deployment"
    ];

    try {
      // Step 1 & 2: Initial Logs
      setLogs(prev => [...prev, "> Starting build process...", `> Found ${mockCommits.length} new commits.`]);
      setBuildStep(steps[0]);
      await new Promise(r => setTimeout(r, 1000));

      // Step 3: AI Analysis
      setBuildStep(steps[2]);
      const risk = await analyzeDeploymentRisk(mockCommits);
      setRiskAnalysis(risk);
      setLogs(prev => [...prev, `> AI Risk Assessment: ${risk.riskLevel}`, `> ${risk.summary}`]);
      await new Promise(r => setTimeout(r, 1500));

      // Step 4-6: Building
      for (let i = 3; i < 6; i++) {
        setBuildStep(steps[i]);
        setLogs(prev => [...prev, `> ${steps[i]}`]);
        await new Promise(r => setTimeout(r, 800));
      }

      // Finalizing
      setBuildStep(steps[6]);
      const newDeployment: DeploymentRecord = {
        id: Math.random().toString(36).substr(2, 9),
        version: `v1.0.${deployments.length + 1}`,
        status: 'success',
        timestamp: new Date().toISOString(),
        deployedBy: user?.name || 'System',
        commit: mockCommits[0].split(':')[0],
        log: logs
      };

      await saveDeployment(newDeployment);
      setDeployments(prev => [newDeployment, ...prev]);
      setLogs(prev => [...prev, "> Build successful. Application live."]);
    } catch (err) {
      setLogs(prev => [...prev, "> FATAL ERROR: Deployment failed."]);
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
          <p className="text-slate-500 font-medium">Manage GitHub integration and cloud delivery pipelines.</p>
        </div>
        
        {user?.isAdmin ? (
          <button 
            onClick={simulateBuild}
            disabled={isBuilding}
            className={`px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-xl transition-all flex items-center space-x-3 ${isBuilding ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          >
            {isBuilding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            )}
            <span>{isBuilding ? 'Deploying...' : 'Trigger New Build'}</span>
          </button>
        ) : (
          <div className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-bold uppercase tracking-widest">
            Admin Access Required
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Logs & Risk */}
        <div className="lg:col-span-2 space-y-8">
          {/* Build Terminal */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="ml-4 text-[10px] font-mono text-slate-400 uppercase tracking-widest">Deployment Logs</span>
              </div>
              {isBuilding && <span className="text-[10px] font-black text-indigo-400 animate-pulse uppercase">{buildStep}</span>}
            </div>
            <div className="p-6 h-[400px] overflow-y-auto font-mono text-xs text-slate-300 space-y-2">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 italic">
                  Waiting for trigger...
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

          {/* AI Risk Assessment */}
          {riskAnalysis && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">AI Risk Assessment</h3>
                    <p className="text-xs text-slate-400 font-medium">Gemini Intelligence Layer</p>
                  </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  riskAnalysis.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                  riskAnalysis.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {riskAnalysis.riskLevel} RISK
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Build Summary</h4>
                  <p className="text-slate-700 text-sm leading-relaxed">{riskAnalysis.summary}</p>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Security & Integrity Concerns</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {riskAnalysis.concerns.map((c: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">History</h3>
              <span className="text-[10px] font-bold text-slate-400">{deployments.length} Total</span>
            </div>
            <div className="divide-y divide-slate-50">
              {deployments.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs italic">
                  No previous deployments.
                </div>
              ) : (
                deployments.map(d => (
                  <div key={d.id} className="p-4 hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-indigo-600">{d.version}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        d.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {d.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center text-[10px] text-slate-500 space-x-2 font-medium">
                      <span>{new Date(d.timestamp).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By {d.deployedBy}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
            <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-2 relative z-10">GitHub Webhook</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4 relative z-10">
              The application is configured to automatically pull updates from your main branch after verification.
            </p>
            <div className="flex items-center space-x-2 text-indigo-400 text-[10px] font-bold font-mono relative z-10">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
              <span>LISTENING_FOR_EVENTS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeploymentPage;