import { X, MapPin, Building2, Trees, GraduationCap } from 'lucide-react';
import type { PlotData } from '@/data/plotData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBlock: string | null;
  onBlockSelect: (block: string | null) => void;
  selectedPlot: PlotData | null;
}

const blocks = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const statusConfig = {
  available: { label: 'Available', color: 'bg-primary' },
  sold: { label: 'Sold', color: 'bg-destructive' },
  reserved: { label: 'Reserved', color: 'bg-accent' },
  commercial: { label: 'Commercial', color: 'bg-[hsl(210,70%,50%)]' },
};

const Sidebar = ({ isOpen, onClose, selectedBlock, onBlockSelect, selectedPlot }: SidebarProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-[1001] lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-[1002] transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-foreground text-lg">Royal Palm City</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
          {/* Legend */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusConfig).map(([key, { label, color }]) => (
                <div key={key} className="flex items-center gap-2 text-sm text-foreground">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Block Filter */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Blocks</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onBlockSelect(null)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  !selectedBlock
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {blocks.map((block) => (
                <button
                  key={block}
                  onClick={() => onBlockSelect(block)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedBlock === block
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {block}
                </button>
              ))}
            </div>
          </div>

          {/* Landmarks */}
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Landmarks</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Trees className="w-4 h-4 text-primary" /> Parks & Green Areas
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <GraduationCap className="w-4 h-4 text-destructive" /> Schools
              </div>
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Building2 className="w-4 h-4 text-[hsl(210,70%,50%)]" /> Commercial
              </div>
            </div>
          </div>

          {/* Selected Plot Info */}
          {selectedPlot && (
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selected Plot</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Block</span>
                  <span className="font-semibold text-foreground">{selectedPlot.block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plot #</span>
                  <span className="font-semibold text-foreground">{selectedPlot.plotNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size</span>
                  <span className="font-semibold text-foreground">{selectedPlot.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-primary">{selectedPlot.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    statusConfig[selectedPlot.status].color
                  } text-primary-foreground`}>
                    {statusConfig[selectedPlot.status].label}
                  </span>
                </div>
              </div>
              <a
                href={`https://wa.me/923001234567?text=Interested in Block ${selectedPlot.block} Plot ${selectedPlot.plotNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full text-center py-2.5 bg-[#25d366] text-white rounded-lg text-sm font-semibold hover:bg-[#20bd5a] transition-colors"
              >
                Contact via WhatsApp
              </a>
            </div>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> Map data is for reference only. Verify with authorities. No liability assumed. Prices may vary.
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
