import React, { useState, useEffect, useMemo } from 'react';
import SpatioMap from './components/SpatioMap';
import GeoMap from './components/GeoMap';
import TrendPanel from './components/TrendPanel';
import { KLANG_VALLEY_NODES, getSimulatedTraffic } from './constants';
import { MapNode, HourlyData } from './types';
import { Clock, Play, Pause, Info, Map as MapIcon, Network } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [currentTime, setCurrentTime] = useState<number>(12); // Hour 0-23
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'schematic' | 'geo'>('schematic');

  // --- Derived State ---
  const selectedNode = useMemo(() => 
    KLANG_VALLEY_NODES.find(n => n.id === selectedNodeId) || null
  , [selectedNodeId]);

  // 1. Generate 24hr Trend Data (for the Area Chart)
  const trendData: HourlyData[] = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const basePop = selectedNode 
        ? selectedNode.basePopularity 
        : KLANG_VALLEY_NODES.reduce((acc, curr) => acc + curr.basePopularity, 0) / KLANG_VALLEY_NODES.length;

      const traffic = getSimulatedTraffic(i, basePop);
      
      const sentiment = Math.max(-1, Math.min(1, Math.cos((i - 12) / 4) * 0.5 + (Math.random() * 0.4 - 0.2)));

      return {
        hour: i,
        totalRidership: traffic,
        averageSentiment: sentiment,
        congestionLevel: traffic / 100
      };
    });
  }, [selectedNode]);

  // 2. Generate Network Snapshot (for the Bar Chart)
  const networkSnapshot = useMemo(() => {
    return KLANG_VALLEY_NODES.map(node => {
      const traffic = getSimulatedTraffic(currentTime, node.basePopularity);
      return {
        id: node.id,
        name: node.name,
        type: node.type,
        traffic: traffic,
        sentiment: Math.max(-1, Math.min(1, Math.cos((currentTime - 12) / 4) * 0.5)),
      };
    }).sort((a, b) => b.traffic - a.traffic); 
  }, [currentTime]);


  // --- Effects ---
  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentTime(prev => (prev + 1) % 24);
      }, 1500); 
    }
    return () => clearInterval(interval);
  }, [isPlaying]);


  // --- Handlers ---
  const handleNodeSelect = (node: MapNode) => {
    setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary selection:text-primary-foreground">
      
      {/* Top Navigation Bar */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm shadow-primary/30">
            K
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Klang Valley Transit Pulse</h1>
            <p className="text-xs text-muted-foreground">Spatio-Temporal Visualization & Multi-Source Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           {/* Time Control */}
           <div className="flex items-center gap-4 bg-secondary/30 rounded-full px-4 py-1.5 border border-border">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-card hover:bg-primary hover:text-primary-foreground text-primary transition shadow-sm border border-border"
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5"/>}
              </button>
              
              <div className="flex flex-col items-center w-32">
                 <div className="flex items-center gap-1.5 text-foreground font-mono font-medium text-sm">
                    <Clock size={14} className="text-muted-foreground" />
                    <span>{currentTime.toString().padStart(2, '0')}:00</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" 
                    max="23" 
                    value={currentTime} 
                    onChange={(e) => {
                        setIsPlaying(false);
                        setCurrentTime(parseInt(e.target.value));
                    }}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mt-1"
                 />
              </div>
           </div>
           
           <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-6">
              <Info size={14} />
              <span>Simulated Data Environment</span>
           </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Left: Map Visualization */}
        <section className="flex-1 p-6 relative flex flex-col min-w-0">
          
          {/* View Toggle */}
          <div className="absolute top-8 left-8 z-30 flex bg-card rounded-lg shadow-md border border-border p-1">
             <button 
                onClick={() => setViewMode('schematic')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'schematic' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
             >
                <Network size={14} />
                Schematic
             </button>
             <button 
                onClick={() => setViewMode('geo')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    viewMode === 'geo' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
             >
                <MapIcon size={14} />
                Geospatial
             </button>
          </div>

          <div className="flex-1 rounded-2xl border border-border shadow-xl shadow-shadow/5 overflow-hidden relative bg-card">
             {viewMode === 'schematic' ? (
                <SpatioMap 
                    currentTime={currentTime} 
                    onNodeSelect={handleNodeSelect}
                    selectedNodeId={selectedNodeId}
                />
             ) : (
                <GeoMap 
                    currentTime={currentTime} 
                    onNodeSelect={handleNodeSelect}
                    selectedNodeId={selectedNodeId}
                />
             )}
             
             {/* Map Overlay Legend */}
             <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm p-3 rounded-lg border border-border shadow-lg text-xs space-y-2 z-[400]">
                <div className="font-semibold text-foreground mb-1">Transit Lines</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-red-500 rounded"></div> Kelana Jaya</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-green-500 rounded"></div> Kajang</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-yellow-500 rounded"></div> Putrajaya</div>
                <div className="flex items-center gap-2"><div className="w-3 h-1 bg-blue-500 rounded"></div> Komuter</div>
             </div>
          </div>
        </section>

        {/* Right: Analytics Dashboard */}
        <aside className="w-[420px] bg-card border-l border-border shadow-xl z-10 flex flex-col">
          <div className="p-5 border-b border-border">
            <h2 className="font-bold text-foreground text-lg tracking-tight">Trend Analysis</h2>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
               {selectedNode ? `Focus: ${selectedNode.name}` : 'Overview: Full Network'}
            </p>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TrendPanel 
                selectedNode={selectedNode}
                currentTime={currentTime}
                trendData={trendData}
                networkSnapshot={networkSnapshot}
            />
          </div>
        </aside>

      </main>
    </div>
  );
};

export default App;