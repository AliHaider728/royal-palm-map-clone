
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('superadmin', 'dealer');

-- 2. User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_name TEXT,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  logo_url TEXT,
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Subscription packages
CREATE TABLE public.subscription_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC DEFAULT 0,
  duration_days INTEGER DEFAULT 30,
  max_properties INTEGER DEFAULT 5,
  features JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;

-- 5. Dealer subscriptions
CREATE TABLE public.dealer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  package_id UUID REFERENCES public.subscription_packages(id) NOT NULL,
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.dealer_subscriptions ENABLE ROW LEVEL SECURITY;

-- 6. Properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'residential',
  listing_type TEXT NOT NULL DEFAULT 'buy',
  price NUMERIC NOT NULL DEFAULT 0,
  area TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  location TEXT,
  city TEXT DEFAULT 'Gujranwala',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 7. Property inquiries
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- 8. Property views tracking
CREATE TABLE public.property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- 9. Validation trigger for listing_type
CREATE OR REPLACE FUNCTION public.validate_listing_type()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.listing_type NOT IN ('buy', 'rent') THEN
    RAISE EXCEPTION 'listing_type must be buy or rent';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_properties_listing_type
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.validate_listing_type();

-- 10. Security definer helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_dealer_property(_user_id UUID, _property_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.properties p
    JOIN public.profiles pr ON pr.id = p.dealer_id
    WHERE p.id = _property_id AND pr.user_id = _user_id
  )
$$;

-- 11. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 13. RLS Policies

-- user_roles
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Superadmin can read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));
CREATE POLICY "Superadmin can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- profiles
CREATE POLICY "Anyone can view active profiles" ON public.profiles FOR SELECT USING (is_active = true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Superadmin can update any profile" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- subscription_packages
CREATE POLICY "Anyone can view packages" ON public.subscription_packages FOR SELECT USING (is_active = true);
CREATE POLICY "Superadmin can manage packages" ON public.subscription_packages FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'superadmin'));

-- dealer_subscriptions
CREATE POLICY "Dealers can view own subscriptions" ON public.dealer_subscriptions FOR SELECT TO authenticated
  USING (dealer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));
CREATE POLICY "Superadmin can view all subscriptions" ON public.dealer_subscriptions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- properties
CREATE POLICY "Anyone can view active properties" ON public.properties FOR SELECT USING (is_active = true);
CREATE POLICY "Dealers can insert properties" ON public.properties FOR INSERT TO authenticated
  WITH CHECK (dealer_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) AND public.has_role(auth.uid(), 'dealer'));
CREATE POLICY "Dealers can update own properties" ON public.properties FOR UPDATE TO authenticated
  USING (public.is_dealer_property(auth.uid(), id));
CREATE POLICY "Dealers can delete own properties" ON public.properties FOR DELETE TO authenticated
  USING (public.is_dealer_property(auth.uid(), id));
CREATE POLICY "Superadmin can view all properties" ON public.properties FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- inquiries
CREATE POLICY "Anyone can create inquiries" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Dealers can view own property inquiries" ON public.inquiries FOR SELECT TO authenticated
  USING (public.is_dealer_property(auth.uid(), property_id));
CREATE POLICY "Superadmin can view all inquiries" ON public.inquiries FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));

-- property_views
CREATE POLICY "Anyone can log views" ON public.property_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Dealers can view own property views" ON public.property_views FOR SELECT TO authenticated
  USING (public.is_dealer_property(auth.uid(), property_id));
CREATE POLICY "Superadmin can view all views" ON public.property_views FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'superadmin'));
