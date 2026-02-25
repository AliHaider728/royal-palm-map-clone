import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Building2, Users, Eye, MessageSquare, LogOut, MapPin, Home, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, profile, isSuperadmin, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({ totalProperties: 0, totalDealers: 0, totalInquiries: 0, totalViews: 0 });
  const [dealers, setDealers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'dealers' | 'properties'>('overview');

  useEffect(() => {
    if (!isLoading && !user) navigate('/login');
    if (!isLoading && user && !isSuperadmin) navigate('/dashboard');
  }, [isLoading, user, isSuperadmin]);

  useEffect(() => {
    if (isSuperadmin) loadData();
  }, [isSuperadmin]);

  const loadData = async () => {
    try {
      const [s, d, p] = await Promise.all([
        api.admin.getStats(),
        api.admin.getAllDealers(),
        api.admin.getAllProperties(),
      ]);
      setStats(s);
      setDealers(d || []);
      setProperties(p || []);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleDealer = async (profileId: string, currentStatus: boolean) => {
    try {
      await api.admin.toggleDealerStatus(profileId, !currentStatus);
      toast({ title: `Dealer ${!currentStatus ? 'activated' : 'deactivated'}` });
      loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  const statCards = [
    { icon: Building2, label: 'Total Properties', value: stats.totalProperties, color: 'text-primary' },
    { icon: Users, label: 'Total Dealers', value: stats.totalDealers, color: 'text-accent' },
    { icon: Eye, label: 'Total Views', value: stats.totalViews, color: 'text-primary' },
    { icon: MessageSquare, label: 'Total Inquiries', value: stats.totalInquiries, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Super Admin</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/"><Button variant="outline" size="sm"><Home className="w-4 h-4 mr-1" /> Map</Button></Link>
          <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }}><LogOut className="w-4 h-4" /></Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {(['overview', 'dealers', 'properties'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">Recent Properties</h2>
            <div className="space-y-3">
              {properties.slice(0, 10).map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{(p as any).profiles?.company_name} · {p.location}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.listing_type === 'buy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                    {p.listing_type === 'buy' ? 'Sale' : 'Rent'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dealers' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">All Dealers</h2>
            <div className="space-y-3">
              {dealers.map(d => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-foreground">{d.company_name || d.full_name}</p>
                    <p className="text-xs text-muted-foreground">{d.email} · {d.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${d.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => toggleDealer(d.id, d.is_active)} className="text-muted-foreground hover:text-foreground">
                      {d.is_active ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                  </div>
                </div>
              ))}
              {dealers.length === 0 && <p className="text-muted-foreground text-center py-6">No dealers found.</p>}
            </div>
          </div>
        )}

        {activeTab === 'properties' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="font-semibold text-foreground mb-4">All Properties ({properties.length})</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 text-muted-foreground font-medium">Title</th>
                    <th className="pb-3 text-muted-foreground font-medium">Dealer</th>
                    <th className="pb-3 text-muted-foreground font-medium">Type</th>
                    <th className="pb-3 text-muted-foreground font-medium">Price</th>
                    <th className="pb-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map(p => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{p.title}</td>
                      <td className="py-3 text-muted-foreground">{(p as any).profiles?.company_name}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${p.listing_type === 'buy' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>{p.listing_type}</span></td>
                      <td className="py-3 text-foreground">PKR {Number(p.price).toLocaleString()}</td>
                      <td className="py-3"><span className={`px-2 py-0.5 rounded text-xs ${p.is_active ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
