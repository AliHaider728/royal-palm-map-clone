import { supabase } from '@/integrations/supabase/client';

// Auth API
export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    },
    register: async (email: string, password: string, metadata: Record<string, string>) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw error;
      return data;
    },
    logout: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    getSession: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    getProfile: async (userId: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    updateProfile: async (profileId: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profileId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    getUserRoles: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      if (error) throw error;
      return data?.map(r => r.role) || [];
    },
  },

  properties: {
    getAll: async (filters?: { listing_type?: string; city?: string; min_price?: number; max_price?: number; search?: string }) => {
      let query = supabase.from('properties').select('*, profiles(company_name, full_name, phone)').eq('is_active', true);
      if (filters?.listing_type) query = query.eq('listing_type', filters.listing_type);
      if (filters?.city) query = query.eq('city', filters.city);
      if (filters?.min_price) query = query.gte('price', filters.min_price);
      if (filters?.max_price) query = query.lte('price', filters.max_price);
      if (filters?.search) query = query.or(`title.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getByDealer: async (dealerProfileId: string) => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('dealer_id', dealerProfileId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(company_name, full_name, phone, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    create: async (property: Record<string, unknown>) => {
      const { data, error } = await supabase.from('properties').insert(property as any).select().single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, updates: Record<string, unknown>) => {
      const { data, error } = await supabase.from('properties').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
      const { error } = await supabase.from('properties').delete().eq('id', id);
      if (error) throw error;
    },
  },

  packages: {
    getAll: async () => {
      const { data, error } = await supabase
        .from('subscription_packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      if (error) throw error;
      return data;
    },
  },

  inquiries: {
    create: async (inquiry: { property_id: string; name: string; email?: string; phone?: string; message?: string }) => {
      const { data, error } = await supabase.from('inquiries').insert(inquiry).select().single();
      if (error) throw error;
      return data;
    },
    getByDealer: async (dealerProfileId: string) => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*, properties(title, location)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  },

  analytics: {
    logView: async (propertyId: string) => {
      await supabase.from('property_views').insert({ property_id: propertyId });
    },
    getDealerStats: async (dealerProfileId: string) => {
      const { data: properties } = await supabase
        .from('properties')
        .select('id, views_count, inquiries_count')
        .eq('dealer_id', dealerProfileId);
      const totalViews = properties?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;
      const totalInquiries = properties?.reduce((sum, p) => sum + (p.inquiries_count || 0), 0) || 0;
      return { totalProperties: properties?.length || 0, totalViews, totalInquiries };
    },
  },

  admin: {
    getAllDealers: async () => {
      const { data: dealerRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'dealer' as any);
      const dealerUserIds = dealerRoles?.map(r => r.user_id) || [];
      if (dealerUserIds.length === 0) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', dealerUserIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    getAllProperties: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, profiles(company_name, full_name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getStats: async () => {
      const { count: totalProperties } = await supabase.from('properties').select('*', { count: 'exact', head: true });
      const { count: totalDealers } = await supabase.from('user_roles').select('*', { count: 'exact', head: true }).eq('role', 'dealer');
      const { count: totalInquiries } = await supabase.from('inquiries').select('*', { count: 'exact', head: true });
      const { count: totalViews } = await supabase.from('property_views').select('*', { count: 'exact', head: true });
      return { totalProperties: totalProperties || 0, totalDealers: totalDealers || 0, totalInquiries: totalInquiries || 0, totalViews: totalViews || 0 };
    },
    toggleDealerStatus: async (profileId: string, isActive: boolean) => {
      const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', profileId);
      if (error) throw error;
    },
  },
};
