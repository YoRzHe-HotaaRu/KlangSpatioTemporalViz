import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { MapNode, HourlyData, AIAnalysisReport } from '../types';
import { KLANG_VALLEY_NODES, getSimulatedTraffic } from '../constants';
import { generateTrendAnalysis } from '../services/geminiService';
import { Loader2, Sparkles, TrendingUp, Users, MapPin, Grid3X3, BarChart3, AlignLeft } from 'lucide-react';

interface TrendPanelProps {
  selectedNode: MapNode | null;
  currentTime: number;
  trendData: HourlyData[];
  networkSnapshot: any[];
}

type TabType = 'trend' | 'compare' | 'density';

const TrendPanel: React.FC<TrendPanelProps> = ({ selectedNode, currentTime, trendData, networkSnapshot }) => {
  const [activeTab, setActiveTab] = useState<TabType>('trend');
  const [analysis, setAnalysis] = useState<AIAnalysisReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // --- Data Logic ---
  const currentStats = trendData.find(d => d.hour === currentTime);
  
  // Heatmap Data Generation (24h x All Nodes)
  const heatmapData = useMemo(() => {
    return KLANG_VALLEY_NODES.map(node => ({
      id: node.id,
      name: node.name,
      hours: Array.from({ length: 24 }, (_, h) => getSimulatedTraffic(h, node.basePopularity))
    }));
  }, []); 

  // --- Handlers ---
  const handleGenerateInsight = async () => {
    setIsAnalyzing(true);
    const currentMetric = currentStats?.totalRidership || 50;
    const result = await generateTrendAnalysis(currentTime, selectedNode, currentMetric);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  // --- Renderers ---

  const renderTimeline = () => (
    <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">24H Projection</span>
            <span className="text-[10px] text-muted-foreground font-mono">LIVE_DATA</span>
        </div>
        <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
                <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0}/>
                </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                    dataKey="hour" 
                    tick={{fontSize: 10, fill: 'var(--muted-foreground)'}} 
                    stroke="var(--border)" 
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                    contentStyle={{
                        borderRadius: 'var(--radius)', 
                        border: '1px solid var(--border)', 
                        boxShadow: 'var(--shadow-lg)',
                        backgroundColor: 'var(--card)',
                        color: 'var(--card-foreground)'
                    }}
                    labelStyle={{color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'var(--font-mono)'}}
                />
                <Area 
                    type="monotone" 
                    dataKey="totalRidership" 
                    stroke="var(--chart-1)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorTraffic)" 
                    animationDuration={500}
                />
            </AreaChart>
            </ResponsiveContainer>
        </div>
    </div>
  );

  const renderBarChart = () => (
    <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Network Load</span>
             <span className="text-[10px] text-muted-foreground font-mono">TOP_NODES</span>
        </div>
        <div className="flex-1 min-h-[220px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={networkSnapshot} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)"/>
                    <XAxis type="number" hide domain={[0, 100]} />
                    <YAxis 
                        dataKey="name" 
                        type="category" 
                        width={80} 
                        tick={{fontSize: 10, fill: 'var(--muted-foreground)'}} 
                        interval={0}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{fill: 'var(--secondary)', opacity: 0.3}}
                        contentStyle={{
                            borderRadius: 'var(--radius)', 
                            border: '1px solid var(--border)', 
                            boxShadow: 'var(--shadow-lg)',
                            backgroundColor: 'var(--card)',
                            color: 'var(--card-foreground)'
                        }}
                    />
                    <Bar dataKey="traffic" radius={[0, 4, 4, 0]} barSize={16}>
                        {networkSnapshot.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={entry.id === selectedNode?.id ? 'var(--primary)' : 'var(--muted)'} 
                            />
                        ))}
                    </Bar>
                </BarChart>
             </ResponsiveContainer>
        </div>
    </div>
  );

  const renderHeatMap = () => (
    <div className="h-full flex flex-col">
         <div className="flex items-center justify-between mb-4">
             <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Density Matrix</span>
             <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-sm bg-secondary"></div>
                <div className="w-2 h-2 rounded-sm bg-primary opacity-50"></div>
                <div className="w-2 h-2 rounded-sm bg-primary"></div>
                <span className="text-[10px] text-muted-foreground ml-1 font-mono">LO-HI</span>
             </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1 mb-6">
                {/* Header Row */}
                <div className="text-[10px] text-muted-foreground text-right pr-2 font-mono">Hr:</div>
                <div className="grid grid-cols-24 gap-0.5">
                    {[0, 6, 12, 18, 23].map(h => (
                        <div key={h} className="text-[8px] text-muted-foreground text-center col-span-1 font-mono" style={{gridColumnStart: h + 1}}>
                            {h}
                        </div>
                    ))}
                </div>

                {/* Data Rows */}
                {heatmapData.map((node) => (
                    <React.Fragment key={node.id}>
                        <div className={`text-[10px] font-medium text-right pr-2 truncate py-1 ${selectedNode?.id === node.id ? 'text-primary' : 'text-muted-foreground'}`}>
                            {node.name}
                        </div>
                        <div className="grid grid-cols-24 gap-[1px] h-full items-center">
                            {node.hours.map((val, h) => {
                                // Opacity based on value (0-100)
                                const opacity = 0.1 + (val / 100) * 0.9;
                                const isCurrentHour = h === currentTime;
                                return (
                                    <div 
                                        key={h}
                                        title={`${node.name} @ ${h}:00 - ${val}% Load`}
                                        className={`h-4 w-full rounded-[1px] transition-all duration-300 ${isCurrentHour ? 'ring-1 ring-accent z-10 scale-110' : ''}`}
                                        style={{
                                            backgroundColor: `color-mix(in srgb, var(--primary), transparent ${100 - (opacity * 100)}%)`
                                        }}
                                    />
                                )
                            })}
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </div>
        <style>{`
            .grid-cols-24 { grid-template-columns: repeat(24, minmax(0, 1fr)); }
        `}</style>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-4 p-4 overflow-hidden">
      
      {/* 1. Header Metrics */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        <div className="bg-secondary/20 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Ridership Index</span>
          </div>
          <div className="text-3xl font-bold text-foreground leading-none tracking-tight">
            {currentStats?.totalRidership ?? 0}<span className="text-xs text-muted-foreground font-normal ml-1 font-mono">/100</span>
          </div>
        </div>
        <div className="bg-secondary/20 p-4 rounded-xl border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wide">Sentiment</span>
          </div>
          <div className={`text-3xl font-bold leading-none tracking-tight ${(currentStats?.averageSentiment ?? 0) > 0 ? 'text-chart-2' : 'text-chart-4'}`}>
            {(currentStats?.averageSentiment ?? 0) > 0 ? 'Positive' : 'Mixed'}
          </div>
        </div>
      </div>

      {/* 2. Visual Analytics Container */}
      <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Tab Controls */}
        <div className="flex border-b border-border p-1 gap-1">
            <button 
                onClick={() => setActiveTab('trend')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'trend' ? 'bg-secondary text-primary shadow-sm' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
            >
                <AlignLeft size={14} /> Trend
            </button>
            <button 
                onClick={() => setActiveTab('compare')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'compare' ? 'bg-secondary text-primary shadow-sm' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
            >
                <BarChart3 size={14} /> Compare
            </button>
            <button 
                 onClick={() => setActiveTab('density')}
                 className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeTab === 'density' ? 'bg-secondary text-primary shadow-sm' : 'text-muted-foreground hover:bg-secondary/50'
                }`}
            >
                <Grid3X3 size={14} /> Density
            </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 min-h-0">
            {activeTab === 'trend' && renderTimeline()}
            {activeTab === 'compare' && renderBarChart()}
            {activeTab === 'density' && renderHeatMap()}
        </div>
      </div>

      {/* 3. AI Insight Section (Fixed at bottom) */}
      <div className="bg-gradient-to-br from-primary/5 to-secondary/10 p-4 rounded-xl border border-border/50 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={16} />
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">Gemini Analyst</h3>
          </div>
          <button 
            onClick={handleGenerateInsight}
            disabled={isAnalyzing}
            className="text-[10px] bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm font-medium"
          >
            {isAnalyzing ? <Loader2 className="animate-spin" size={10}/> : 'Generate Report'}
          </button>
        </div>

        {analysis ? (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs text-foreground/80 leading-relaxed italic border-l-2 border-primary pl-3 font-medium">
              "{analysis.summary}"
            </p>
            
            <div className="mt-2 pt-2 border-t border-border/50">
               <div className="grid grid-cols-1 gap-1">
                 {analysis.identifiedTrends.slice(0, 2).map((trend, i) => (
                   <div key={i} className="text-[10px] text-muted-foreground flex items-start gap-1.5">
                     <span className="w-1 h-1 bg-accent rounded-full mt-1.5 flex-shrink-0"></span>
                     {trend}
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="text-[9px] text-muted-foreground mt-2 text-right font-mono opacity-60">
              UPDATED: {new Date(analysis.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground text-xs bg-card/50 rounded-lg border border-dashed border-border">
            <p>AI Analysis ready. Click generate.</p>
          </div>
        )}
      </div>

       {selectedNode && (
        <div className="bg-card px-4 py-3 rounded-xl border border-border flex-shrink-0 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-secondary/30 rounded-lg text-primary">
                <MapPin size={18} />
            </div>
            <div>
                <h4 className="font-bold text-foreground text-sm">{selectedNode.name}</h4>
                <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 line-clamp-1">
                    {selectedNode.type} • {selectedNode.description}
                </p>
            </div>
        </div>
      )}

    </div>
  );
};

export default TrendPanel;