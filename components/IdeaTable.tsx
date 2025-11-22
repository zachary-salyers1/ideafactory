import React, { useState } from 'react';
import { Idea } from '../types';
import { Badge } from './ui/Badge';
import { ArrowUpRight, BarChart2, DollarSign, Smartphone, Monitor, Globe, Box } from 'lucide-react';

interface IdeaTableProps {
  ideas: Idea[];
  onBuild: (idea: Idea) => void;
}

export const IdeaTable: React.FC<IdeaTableProps> = ({ ideas, onBuild }) => {
  const [sortConfig, setSortConfig] = useState<{ key: keyof Idea; direction: 'asc' | 'desc' } | null>({ key: 'success_probability', direction: 'desc' });

  const sortedIdeas = React.useMemo(() => {
    let sortableIdeas = [...ideas];
    if (sortConfig !== null) {
      sortableIdeas.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableIdeas;
  }, [ideas, sortConfig]);

  const requestSort = (key: keyof Idea) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Mobile': return <Smartphone className="w-4 h-4" />;
      case 'Web': return <Globe className="w-4 h-4" />;
      case 'Desktop': return <Monitor className="w-4 h-4" />;
      default: return <Box className="w-4 h-4" />;
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'Low': return 'success';
      case 'Medium': return 'warning';
      case 'High': return 'danger';
      case 'Very High': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="bg-surface border-b border-slate-800 uppercase font-medium text-xs tracking-wider">
          <tr>
            <th className="px-6 py-4 cursor-pointer hover:text-slate-200" onClick={() => requestSort('success_probability')}>Score</th>
            <th className="px-6 py-4">Idea Name & Pitch</th>
            <th className="px-6 py-4 cursor-pointer hover:text-slate-200" onClick={() => requestSort('platform')}>Platform</th>
            <th className="px-6 py-4 cursor-pointer hover:text-slate-200" onClick={() => requestSort('monthly_search_volume')}>Volume</th>
            <th className="px-6 py-4 cursor-pointer hover:text-slate-200" onClick={() => requestSort('competition_level')}>Comp</th>
            <th className="px-6 py-4 cursor-pointer hover:text-slate-200" onClick={() => requestSort('estimated_revenue_high_usd')}>Est. Rev (Year 1)</th>
            <th className="px-6 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/50">
          {sortedIdeas.map((idea) => (
            <tr key={idea.id} className={`group hover:bg-slate-800/30 transition-colors ${idea.chosen ? 'bg-blue-950/20' : ''}`}>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <span className={`font-bold text-lg ${idea.success_probability >= 90 ? 'text-emerald-400' : idea.success_probability >= 80 ? 'text-blue-400' : 'text-slate-400'}`}>
                        {idea.success_probability}%
                    </span>
                </div>
              </td>
              <td className="px-6 py-4 max-w-md">
                <div className="font-medium text-slate-200 text-base mb-1">{idea.name}</div>
                <div className="text-slate-500 line-clamp-2 leading-relaxed">{idea.one_liner}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-slate-300">
                  {getPlatformIcon(idea.platform)}
                  <span>{idea.platform}</span>
                </div>
              </td>
              <td className="px-6 py-4 font-mono text-slate-300">
                {idea.monthly_search_volume.toLocaleString()}
              </td>
              <td className="px-6 py-4">
                <Badge variant={getCompetitionColor(idea.competition_level) as any}>
                  {idea.competition_level}
                </Badge>
              </td>
              <td className="px-6 py-4 font-mono text-emerald-400/90">
                ${(idea.estimated_revenue_low_usd / 1000).toFixed(0)}k - ${(idea.estimated_revenue_high_usd / 1000).toFixed(0)}k
              </td>
              <td className="px-6 py-4 text-right">
                 <button 
                    onClick={() => onBuild(idea)}
                    disabled={idea.chosen}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all
                        ${idea.chosen 
                            ? 'bg-emerald-500/20 text-emerald-400 cursor-default' 
                            : 'bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
                        }`}
                 >
                    {idea.chosen ? (
                        <>BUILT</>
                    ) : (
                        <>
                            BUILD THIS <ArrowUpRight className="w-3 h-3" />
                        </>
                    )}
                 </button>
              </td>
            </tr>
          ))}
          {sortedIdeas.length === 0 && (
            <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No ideas generated yet. Run the swarm manually.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
