"use client";

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  Layers, 
  Search, 
  ShoppingCart, 
  Youtube, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Plus,
  Loader2
} from 'lucide-react';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const [activeLevel, setActiveLevel] = useState(1);
  const [trends, setTrends] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<any>(null);
  const [topic, setTopic] = useState("AI 업무 자동화");
  const [variationCount, setVariationCount] = useState(1);
  const [workflowSteps, setWorkflowSteps] = useState([
    { title: 'SerpApi Market Research', status: 'Completed', time: 'Just now', icon: Search, color: 'bg-emerald-500' },
    { title: 'AI Content Orchestration', status: 'Waiting', time: 'Ready', icon: Layers, color: 'bg-slate-700' },
    { title: 'Coupang Links Matching', status: 'Waiting', time: 'Queued', icon: ShoppingCart, color: 'bg-slate-700' },
    { title: 'Final Review & Publish', status: 'Waiting', time: 'Queued', icon: Send, color: 'bg-slate-700' },
  ]);

  useEffect(() => {
    const loadTrends = async () => {
      try {
        const res = await fetch('/api/trends');
        const data = await res.json();
        if (data.organic_results) {
          setTrends(data.organic_results.map((r: any) => ({
            keyword: r.title.length > 20 ? r.title.substring(0, 18) + "..." : r.title,
            search: "Live",
            trend: Math.random() > 0.3 ? 'up' : 'down'
          })));
        }
      } catch (err) {
        console.error("Trends load failed", err);
      }
    };
    loadTrends();
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setWorkflowSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'Processing', color: 'bg-blue-500' } : s));
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: activeLevel, topic, count: variationCount })
      });
      const result = await res.json();
      setLastGenerated(result);
      
      setWorkflowSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'Completed', color: 'bg-emerald-500' } : s));
    } catch (err) {
      console.error("Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="flex bg-[#020617] text-slate-100 overflow-hidden pt-16 min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-[#0f172a] border-r border-white/5 flex flex-col hidden md:flex">
          <div className="p-6">
          <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
            <TrendingUp className="text-blue-500" />
            AI Content OS
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <div className="sidebar-item active">
            <LayoutDashboard size={20} />
            Dashboard
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-4 pt-4 pb-2">Content Layers</div>
          <div className="sidebar-item" onClick={() => setActiveLevel(1)} style={{ background: activeLevel === 1 ? 'rgba(59, 130, 246, 0.1)' : '' }}>
            <Layers size={20} />
            Level 1: 기초 (Viral)
          </div>
          <div className="sidebar-item" onClick={() => setActiveLevel(2)} style={{ background: activeLevel === 2 ? 'rgba(59, 130, 246, 0.1)' : '' }}>
            <Layers size={20} />
            Level 2: 실무 (Practical)
          </div>
          <div className="sidebar-item" onClick={() => setActiveLevel(3)} style={{ background: activeLevel === 3 ? 'rgba(59, 130, 246, 0.1)' : '' }}>
            <Layers size={20} />
            Level 3: 전문가 (Expert)
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-start mb-10">
          <div className="flex-1 max-w-2xl mr-8">
            <h2 className="text-3xl font-bold mb-4">Content Strategy Lab</h2>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter target topic..." 
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="w-24">
                <select 
                  value={variationCount}
                  onChange={(e) => setVariationCount(parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl py-3 px-4 focus:outline-none transition-all appearance-none text-center"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                </select>
              </div>
            </div>
          </div>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 mt-10"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            Generate {variationCount} Variations
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Content', value: '128', icon: BarChart3, color: 'text-blue-500' },
            { label: 'Weekly Reach', value: '45.2K', icon: Youtube, color: 'text-red-500' },
            { label: 'Coupang Revenue', value: '₩2.1M', icon: ShoppingCart, color: 'text-emerald-500' },
            { label: 'Avg. Engagement', value: '8.4%', icon: TrendingUp, color: 'text-purple-500' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 glow-card transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-slate-800 ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-xs font-medium text-emerald-400 font-mono">+12%</span>
              </div>
              <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <section className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Layers size={22} className="text-blue-500" />
                Latest Generated Previews
              </h3>
              
              {lastGenerated?.variations ? (
                <div className="space-y-6">
                  {lastGenerated.variations.map((v: any) => (
                    <div key={v.id} className="glass rounded-2xl p-6 border-blue-500/20 bg-blue-500/5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 px-4 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase rounded-bl-xl border-l border-b border-blue-500/20">
                        {v.style}
                      </div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                          {lastGenerated.level === 1 ? <Send size={18} /> : <Youtube size={18} />}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{v.platform} Strategy v{v.id}</h4>
                          <p className="text-xs text-slate-400">{v.processed_at}</p>
                        </div>
                      </div>
                      <div className="bg-slate-900/50 rounded-xl p-5 font-mono text-sm border border-white/5 leading-relaxed whitespace-pre-wrap">
                        {v.content}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-3xl p-20 flex flex-col items-center justify-center text-slate-500 border-dashed border-2">
                  <div className="animate-pulse flex flex-col items-center">
                    <Plus size={48} className="mb-4 opacity-10" />
                    <p className="text-sm font-medium">상단에서 주제 입력 후 콘텐츠를 생성하세요.</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <section className="glass rounded-3xl p-8 border-white/5">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <CheckCircle2 size={24} className="text-blue-500" />
                Workflow
              </h3>
              <div className="relative space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {workflowSteps.map((step, i) => (
                  <div key={i} className="relative pl-10">
                    <div className={`absolute left-0 top-0 w-6 h-6 rounded-full ${step.color} border-4 border-[#020617] z-10 flex items-center justify-center`}>
                      {step.status === 'Completed' && <CheckCircle2 size={12} className="text-white" />}
                      {step.status === 'Processing' && <Loader2 size={12} className="text-white animate-spin" />}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold mb-0.5">{step.title}</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">{step.status}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-3xl p-6 border-white/5">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Search size={20} className="text-blue-500" />
                Trending Keywords
              </h3>
              <div className="space-y-4">
                {trends.length > 0 ? trends.map((item, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="font-medium text-xs break-all pr-2">{item.keyword}</div>
                    <TrendingUp size={14} className={item.trend === 'up' ? 'text-emerald-500' : 'text-red-500'} />
                  </div>
                )) : (
                  <div className="text-center py-4 text-slate-500 text-sm italic">Loading real-time trends...</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}
