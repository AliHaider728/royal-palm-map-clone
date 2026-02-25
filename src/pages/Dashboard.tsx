import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Building2, Eye, MessageSquare, Plus, Trash2, Edit, LogOut, User, MapPin, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, profile, isDealer, isSuperadmin, isLoading, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProperties: 0, totalViews: 0, totalInquiries: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProperty, setNewProperty] = useState({
    title: '', description: '', property_type: 'house', listing_type: 'buy',
    price: '', area: '', bedrooms: '0', bathrooms: '0', location: '', city: 'Gujranwala',
    latitude: '', longitude: '',
  });

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
    if (!isLoading && isSuperadmin) navigate('/admin');
  }, [isLoading, user, isSuperadmin]);

  useEffect(() => {
    if (profile?.id) {
      loadData();
    }
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile?.id) return;
    try {
      const [props, dealerStats] = await Promise.all([
        api.properties.getByDealer(profile.id),
        api.analytics.getDealerStats(profile.id),
      ]);
      setProperties(props || []);
      setStats(dealerStats);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    try {
      await api.properties.create({
        ...newProperty,
        dealer_id: profile.id,
        price: parseFloat(newProperty.price) || 0,
        bedrooms: parseInt(newProperty.bedrooms) || 0,
        bathrooms: parseInt(newProperty.bathrooms) || 0,
        latitude: parseFloat(newProperty.latitude) || null,
        longitude: parseFloat(newProperty.longitude) || null,
      });
      toast({ title: 'Property added!' });
      setShowAddForm(false);
      setNewProperty({ title: '', description: '', property_type: 'house', listing_type: 'buy', price: '', area: '', bedrooms: '0', bathrooms: '0', location: '', city: 'Gujranwala', latitude: '', longitude: '' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.properties.delete(id);
      toast({ title: 'Property deleted' });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Dealer Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="outline" size="sm"><Home className="w-4 h-4 mr-1" /> Map</Button>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-foreground">{profile?.company_name || profile?.full_name || 'Dealer'}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: Building2, label: 'Properties', value: stats.totalProperties, color: 'text-primary' },
            { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'text-accent' },
            { icon: MessageSquare, label: 'Inquiries', value: stats.totalInquiries, color: 'text-primary' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className={`w-6 h-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">My Properties</h2>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" /> Add Property
          </Button>
        </div>

        {/* Add Property Form */}
        {showAddForm && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-foreground mb-4">New Property</h3>
            <form onSubmit={handleAddProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Title" value={newProperty.title} onChange={e => setNewProperty(p => ({ ...p, title: e.target.value }))} required />
              <Input placeholder="Price (PKR)" type="number" value={newProperty.price} onChange={e => setNewProperty(p => ({ ...p, price: e.target.value }))} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newProperty.listing_type} onChange={e => setNewProperty(p => ({ ...p, listing_type: e.target.value }))}>
                <option value="buy">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newProperty.property_type} onChange={e => setNewProperty(p => ({ ...p, property_type: e.target.value }))}>
                <option value="house">House</option>
                <option value="plot">Plot</option>
                <option value="apartment">Apartment</option>
                <option value="commercial">Commercial</option>
              </select>
              <Input placeholder="Area (e.g. 5 Marla)" value={newProperty.area} onChange={e => setNewProperty(p => ({ ...p, area: e.target.value }))} />
              <Input placeholder="Location" value={newProperty.location} onChange={e => setNewProperty(p => ({ ...p, location: e.target.value }))} />
              <Input placeholder="Bedrooms" type="number" value={newProperty.bedrooms} onChange={e => setNewProperty(p => ({ ...p, bedrooms: e.target.value }))} />
              <Input placeholder="Bathrooms" type="number" value={newProperty.bathrooms} onChange={e => setNewProperty(p => ({ ...p, bathrooms: e.target.value }))} />
              <Input placeholder="Latitude" value={newProperty.latitude} onChange={e => setNewProperty(p => ({ ...p, latitude: e.target.value }))} />
              <Input placeholder="Longitude" value={newProperty.longitude} onChange={e => setNewProperty(p => ({ ...p, longitude: e.target.value }))} />
              <div className="md:col-span-2">
                <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Description" value={newProperty.description} onChange={e => setNewProperty(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <Button type="submit">Save Property</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}

        {/* Properties List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map(prop => (
            <div key={prop.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${prop.listing_type === 'buy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                  {prop.listing_type === 'buy' ? 'For Sale' : 'For Rent'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => handleDelete(prop.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground mb-1">{prop.title}</h3>
              <p className="text-sm text-muted-foreground mb-2">{prop.location}</p>
              <p className="text-lg font-bold text-primary">PKR {Number(prop.price).toLocaleString()}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                <span>{prop.area}</span>
                {prop.bedrooms > 0 && <span>{prop.bedrooms} Bed</span>}
                {prop.bathrooms > 0 && <span>{prop.bathrooms} Bath</span>}
              </div>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {prop.views_count} views</span>
                <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {prop.inquiries_count} inquiries</span>
              </div>
            </div>
          ))}
          {properties.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No properties yet. Click "Add Property" to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
