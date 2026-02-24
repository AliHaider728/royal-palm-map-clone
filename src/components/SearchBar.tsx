import { Search, Menu } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onMenuToggle: () => void;
}

const SearchBar = ({ value, onChange, onMenuToggle }: SearchBarProps) => {
  return (
    <div className="absolute top-4 left-4 right-16 z-[1000] flex items-center gap-2 max-w-lg">
      <div className="flex items-center w-full bg-card rounded-lg shadow-lg border border-border overflow-hidden">
        <button
          onClick={onMenuToggle}
          className="p-3 hover:bg-muted transition-colors"
          aria-label="Menu"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search by block, plot, size..."
          className="flex-1 bg-transparent px-2 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button className="p-3 hover:bg-muted transition-colors" aria-label="Search">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
