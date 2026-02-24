import { useState, useCallback } from 'react';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import Sidebar from '@/components/Sidebar';
import { User, Share2, Locate } from 'lucide-react';
import type { PlotData } from '@/data/plotData';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<PlotData | null>(null);

  const handlePlotSelect = useCallback((plot: PlotData) => {
    setSelectedPlot(plot);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Map */}
      <MapView
        searchQuery={searchQuery}
        selectedBlock={selectedBlock}
        onPlotSelect={handlePlotSelect}
      />

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onMenuToggle={() => setSidebarOpen(true)}
      />

      {/* User button top-right */}
      <button
        className="absolute top-4 right-4 z-[1000] w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="User"
      >
        <User className="w-5 h-5 text-muted-foreground" />
      </button>

      {/* Left-side controls */}
      <div className="absolute bottom-24 left-4 z-[1000] flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Share">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="My Location">
          <Locate className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedBlock={selectedBlock}
        onBlockSelect={setSelectedBlock}
        selectedPlot={selectedPlot}
      />

      {/* Disclaimer bar */}
      <div className="absolute bottom-0 left-0 right-0 z-[999] bg-card/90 backdrop-blur-sm border-t border-border px-4 py-1.5 text-[10px] text-muted-foreground text-right">
        Disclaimer: Map data is for reference only. Verify with authorities. No liability assumed.
      </div>
    </div>
  );
};

export default Index;
