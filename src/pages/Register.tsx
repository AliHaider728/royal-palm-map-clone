import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, UserPlus, MapPin, Building2, Phone, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const steps = ['Personal Info', 'Company Details', 'Security'];

const Register = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    companyName: '', bio: '',
    password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    if (step === 0 && (!form.fullName || !form.email)) {
      toast({ title: 'Required', description: 'Name and email are required.', variant: 'destructive' });
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, { full_name: form.fullName });
      // Update profile with extra info
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', session.user.id).single();
        if (profile) {
          await supabase.from('profiles').update({
            company_name: form.companyName,
            phone: form.phone,
            bio: form.bio,
          }).eq('id', profile.id);
        }
        // Assign dealer role
        await supabase.from('user_roles').insert({ user_id: session.user.id, role: 'dealer' as any });
      }
      toast({ title: 'Account created!', description: 'Welcome to MapEstate.' });
      navigate('/dashboard');
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dealer Registration</h1>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                <p className={`text-[10px] mt-1 text-center ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>{s}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 0 && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
                  <Input value={form.fullName} onChange={e => update('fullName', e.target.value)} placeholder="Your full name" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@example.com" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+92-300-1234567" />
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Company Name</label>
                  <Input value={form.companyName} onChange={e => update('companyName', e.target.value)} placeholder="Your Real Estate Company" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Bio / About</label>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px]"
                    value={form.bio}
                    onChange={e => update('bio', e.target.value)}
                    placeholder="Tell us about your business..."
                  />
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Confirm Password</label>
                  <Input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} placeholder="Confirm password" required />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {step > 0 && (
                <Button type="button" variant="outline" onClick={() => setStep(step - 1)} className="flex-1">Back</Button>
              )}
              {step < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} className="flex-1">Next</Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={loading}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
