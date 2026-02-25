import { useState, useCallback, useEffect } from 'react';
import MapView from '@/components/MapView';
import SearchBar from '@/components/SearchBar';
import { User, Share2, Locate } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [listingFilter, setListingFilter] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    loadProperties();
  }, [listingFilter]);

  const loadProperties = async () => {
    try {
      const data = await api.properties.getAll({
        listing_type: listingFilter || undefined,
        search: searchQuery || undefined,
      });
      setProperties(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadProperties(), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePropertySelect = useCallback((property: any) => {
    setSelectedProperty(property);
    // Log view
    api.analytics.logView(property.id).catch(() => {});
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapView searchQuery={searchQuery} properties={properties} onPropertySelect={handlePropertySelect} />

      <SearchBar value={searchQuery} onChange={setSearchQuery} onMenuToggle={() => {}} />

      {/* Filter pills */}
      {searchQuery && (
        <div className="absolute top-20 left-4 z-[1000] flex gap-2">
          {['', 'buy', 'rent'].map(f => (
            <button
              key={f}
              onClick={() => setListingFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                listingFilter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {f === '' ? 'All' : f === 'buy' ? 'Buy' : 'Rent'}
            </button>
          ))}
        </div>
      )}

      {/* User button */}
      <Link
        to={user ? '/dashboard' : '/login'}
        className="absolute top-4 right-4 z-[1000] w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
        aria-label="User"
      >
        <User className="w-5 h-5 text-muted-foreground" />
      </Link>

      {/* Left controls */}
      <div className="absolute bottom-24 left-4 z-[1000] flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Share">
          <Share2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="w-10 h-10 rounded-full bg-card shadow-lg border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="My Location">
          <Locate className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Selected property card */}
      {selectedProperty && (
        <div className="absolute bottom-16 left-4 right-4 z-[1000] bg-card border border-border rounded-xl p-4 shadow-xl max-w-sm mx-auto">
          <button onClick={() => setSelectedProperty(null)} className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-lg">&times;</button>
          <h3 className="font-semibold text-foreground pr-6">{selectedProperty.title}</h3>
          <p className="text-sm text-muted-foreground">{selectedProperty.location}</p>
          <p className="text-lg font-bold text-primary mt-1">PKR {Number(selectedProperty.price).toLocaleString()}</p>
          <div className="flex gap-3 text-xs text-muted-foreground mt-2">
            <span>{selectedProperty.area}</span>
            {selectedProperty.bedrooms > 0 && <span>{selectedProperty.bedrooms} Bed</span>}
            {selectedProperty.bathrooms > 0 && <span>{selectedProperty.bathrooms} Bath</span>}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="absolute bottom-0 left-0 right-0 z-[999] bg-card/90 backdrop-blur-sm border-t border-border px-4 py-1.5 text-[10px] text-muted-foreground text-right">
        Disclaimer: Map data is for reference only. Verify with authorities. No liability assumed.
      </div>
    </div>
  );
};

export default Index;
