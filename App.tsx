import React, { useState, useEffect } from 'react';
import { BrainCircuit, Play, RefreshCw, Settings } from 'lucide-react';
import { IdeaTable } from './components/IdeaTable';
import { StatsOverview } from './components/StatsOverview';
import { BuildModal } from './components/BuildModal';
import { generateDailyIdeas, generateBuildPlan } from './services/geminiService';
import { Idea, BuildPlan } from './types';

function App() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRunDate, setLastRunDate] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [buildPlan, setBuildPlan] = useState<BuildPlan | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  // Initialization
  useEffect(() => {
    const storedIdeas = localStorage.getItem('ideaFactory_ideas');
    const storedDate = localStorage.getItem('ideaFactory_lastRun');
    if (storedIdeas) {
      setIdeas(JSON.parse(storedIdeas));
    }
    if (storedDate) {
      setLastRunDate(storedDate);
    }
  }, []);

  // Generate Handler
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newIdeas = await generateDailyIdeas();
      // Merge with existing ideas, put new ones at top
      const updatedIdeas = [...newIdeas, ...ideas];
      setIdeas(updatedIdeas);
      setLastRunDate(new Date().toISOString());
      
      localStorage.setItem('ideaFactory_ideas', JSON.stringify(updatedIdeas));
      localStorage.setItem('ideaFactory_lastRun', new Date().toISOString());
    } catch (e) {
      console.error("Failed to generate", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Build Handler
  const handleBuild = async (idea: Idea) => {
    setSelectedIdea(idea);
    setIsModalOpen(true);
    setIsBuilding(true);
    setBuildPlan(null);

    try {
      const plan = await generateBuildPlan(idea);
      setBuildPlan(plan);
      
      // Mark idea as chosen
      const updatedIdeas = ideas.map(i => i.id === idea.id ? { ...i, chosen: true } : i);
      setIdeas(updatedIdeas);
      localStorage.setItem('ideaFactory_ideas', JSON.stringify(updatedIdeas));

    } catch (e) {
      console.error("Failed to build plan", e);
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-slate-200 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <BrainCircuit className="w-10 h-10 text-primary" />
              IdeaFactory <span className="text-primary">2025</span>
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base leading-relaxed">
              Fully autonomous daily profitable-idea machine. Wakes up, discovers validated opportunities, and prepares them for execution.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Systems Online
                </div>
             </div>
             <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                    ${isGenerating 
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-white text-slate-950 hover:bg-slate-200 shadow-lg shadow-slate-200/10'
                    }`}
             >
                {isGenerating ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                    <Play className="w-5 h-5 fill-current" />
                )}
                {isGenerating ? 'Running Swarm...' : 'Run Daily Batch'}
             </button>
          </div>
        </header>

        {/* Stats */}
        <StatsOverview ideas={ideas} />

        {/* Main Content */}
        <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-bold text-white">Validated Opportunities</h2>
                <div className="text-xs text-slate-500 font-mono">
                    LAST RUN: {lastRunDate ? new Date(lastRunDate).toLocaleString() : 'NEVER'}
                </div>
            </div>

            <div className="bg-surface border border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <IdeaTable ideas={ideas} onBuild={handleBuild} />
            </div>
        </div>

      </div>

      {/* Modals */}
      <BuildModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        idea={selectedIdea} 
        plan={buildPlan}
        isLoading={isBuilding}
      />
    </div>
  );
}

export default App;
