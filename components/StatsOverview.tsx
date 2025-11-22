import React from 'react';
import { Idea } from '../types';
import { TrendingUp, Zap, DollarSign, Activity } from 'lucide-react';

interface StatsOverviewProps {
  ideas: Idea[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ ideas }) => {
  const totalPotentialRevenue = ideas.reduce((acc, curr) => acc + curr.estimated_revenue_high_usd, 0);
  const avgSuccessScore = ideas.length > 0 ? Math.round(ideas.reduce((acc, curr) => acc + curr.success_probability, 0) / ideas.length) : 0;
  const highConfidenceCount = ideas.filter(i => i.success_probability >= 80).length;

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-surface border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        title="Pipeline Value" 
        value={`$${(totalPotentialRevenue / 1000000).toFixed(2)}M`} 
        sub="Total Year-1 Potential"
        icon={DollarSign}
        color="bg-emerald-500/20"
      />
      <StatCard 
        title="Ideas Generated" 
        value={ideas.length} 
        sub="Last 24 Hours"
        icon={Zap}
        color="bg-amber-500/20"
      />
       <StatCard 
        title="Avg. Success Prob" 
        value={`${avgSuccessScore}%`} 
        sub="Validation Score"
        icon={Activity}
        color="bg-blue-500/20"
      />
       <StatCard 
        title="High Confidence" 
        value={highConfidenceCount} 
        sub="Score > 80%"
        icon={TrendingUp}
        color="bg-purple-500/20"
      />
    </div>
  );
};
