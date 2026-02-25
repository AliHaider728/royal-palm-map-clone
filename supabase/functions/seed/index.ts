import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // 1. Create superadmin user
    const { data: superadminAuth, error: saErr } = await supabaseAdmin.auth.admin.createUser({
      email: 'superadmin@emap.pk',
      password: 'superadmin123',
      email_confirm: true,
      user_metadata: { full_name: 'Super Admin' }
    })
    if (saErr && !saErr.message.includes('already been registered')) throw saErr

    const superadminId = superadminAuth?.user?.id
    if (superadminId) {
      // Assign superadmin role
      await supabaseAdmin.from('user_roles').upsert({ user_id: superadminId, role: 'superadmin' }, { onConflict: 'user_id,role' })
      // Update profile
      const { data: saProfile } = await supabaseAdmin.from('profiles').select('id').eq('user_id', superadminId).single()
      if (saProfile) {
        await supabaseAdmin.from('profiles').update({ company_name: 'MapEstate Admin', full_name: 'Super Admin', phone: '+92-300-0000000' }).eq('id', saProfile.id)
      }
    }

    // 2. Create dealer1
    const { data: dealer1Auth, error: d1Err } = await supabaseAdmin.auth.admin.createUser({
      email: 'dealer1@emap.pk',
      password: 'dealer123',
      email_confirm: true,
      user_metadata: { full_name: 'Ahmad Properties' }
    })
    if (d1Err && !d1Err.message.includes('already been registered')) throw d1Err

    const dealer1Id = dealer1Auth?.user?.id
    let dealer1ProfileId: string | undefined
    if (dealer1Id) {
      await supabaseAdmin.from('user_roles').upsert({ user_id: dealer1Id, role: 'dealer' }, { onConflict: 'user_id,role' })
      const { data: d1Profile } = await supabaseAdmin.from('profiles').select('id').eq('user_id', dealer1Id).single()
      dealer1ProfileId = d1Profile?.id
      if (d1Profile) {
        await supabaseAdmin.from('profiles').update({ company_name: 'Ahmad Properties', full_name: 'Ahmad Khan', phone: '+92-321-1234567', bio: 'Leading real estate dealer in Gujranwala with 10+ years experience.' }).eq('id', d1Profile.id)
      }
    }

    // 3. Create dealer2
    const { data: dealer2Auth, error: d2Err } = await supabaseAdmin.auth.admin.createUser({
      email: 'dealer2@emap.pk',
      password: 'dealer123',
      email_confirm: true,
      user_metadata: { full_name: 'Royal Estate Agency' }
    })
    if (d2Err && !d2Err.message.includes('already been registered')) throw d2Err

    const dealer2Id = dealer2Auth?.user?.id
    let dealer2ProfileId: string | undefined
    if (dealer2Id) {
      await supabaseAdmin.from('user_roles').upsert({ user_id: dealer2Id, role: 'dealer' }, { onConflict: 'user_id,role' })
      const { data: d2Profile } = await supabaseAdmin.from('profiles').select('id').eq('user_id', dealer2Id).single()
      dealer2ProfileId = d2Profile?.id
      if (d2Profile) {
        await supabaseAdmin.from('profiles').update({ company_name: 'Royal Estate Agency', full_name: 'Bilal Sheikh', phone: '+92-333-9876543', bio: 'Premium properties in Royal Palm City Gujranwala.' }).eq('id', d2Profile.id)
      }
    }

    // 4. Subscription packages
    const packages = [
      { name: 'Free', price: 0, duration_days: 30, max_properties: 5, features: ['5 Listings', 'Basic Analytics', 'Email Support'], display_order: 1 },
      { name: 'Premium', price: 4999, duration_days: 30, max_properties: 25, features: ['25 Listings', 'Advanced Analytics', 'Featured Listings', 'Priority Support', 'WhatsApp Integration'], display_order: 2 },
      { name: 'Enterprise', price: 14999, duration_days: 30, max_properties: 100, features: ['100 Listings', 'Full Analytics', 'All Featured', 'Dedicated Support', 'Custom Branding', 'API Access'], display_order: 3 },
    ]
    for (const pkg of packages) {
      await supabaseAdmin.from('subscription_packages').upsert(
        { ...pkg, features: JSON.stringify(pkg.features) },
        { onConflict: 'name' }
      )
    }

    // 5. Example properties
    if (dealer1ProfileId) {
      const props1 = [
        { dealer_id: dealer1ProfileId, title: '5 Marla House in Block A', description: 'Beautiful 5 marla house with modern design, 3 bedrooms, attached bathrooms.', property_type: 'house', listing_type: 'buy', price: 8500000, area: '5 Marla', bedrooms: 3, bathrooms: 3, location: 'Block A, Royal Palm City', city: 'Gujranwala', latitude: 32.1940, longitude: 74.1870, is_featured: true },
        { dealer_id: dealer1ProfileId, title: '10 Marla Plot in Block B', description: 'Prime location 10 marla residential plot. Ready for construction.', property_type: 'plot', listing_type: 'buy', price: 4500000, area: '10 Marla', bedrooms: 0, bathrooms: 0, location: 'Block B, Royal Palm City', city: 'Gujranwala', latitude: 32.1935, longitude: 74.1885 },
        { dealer_id: dealer1ProfileId, title: '3 Bed Apartment for Rent', description: 'Fully furnished 3 bedroom apartment near main market.', property_type: 'apartment', listing_type: 'rent', price: 45000, area: '1500 sqft', bedrooms: 3, bathrooms: 2, location: 'Main Boulevard, Gujranwala', city: 'Gujranwala', latitude: 32.1877, longitude: 74.1861 },
      ]
      for (const p of props1) {
        await supabaseAdmin.from('properties').insert(p)
      }
    }

    if (dealer2ProfileId) {
      const props2 = [
        { dealer_id: dealer2ProfileId, title: '1 Kanal Luxury Villa', description: 'Stunning 1 kanal villa with swimming pool, garden, and smart home features.', property_type: 'house', listing_type: 'buy', price: 35000000, area: '1 Kanal', bedrooms: 5, bathrooms: 6, location: 'Block C, Royal Palm City', city: 'Gujranwala', latitude: 32.1950, longitude: 74.1900, is_featured: true },
        { dealer_id: dealer2ProfileId, title: 'Commercial Shop for Rent', description: 'Ground floor commercial shop in busy market area. Great footfall.', property_type: 'commercial', listing_type: 'rent', price: 80000, area: '400 sqft', bedrooms: 0, bathrooms: 1, location: 'Commercial Block, Royal Palm City', city: 'Gujranwala', latitude: 32.1925, longitude: 74.1895 },
      ]
      for (const p of props2) {
        await supabaseAdmin.from('properties').insert(p)
      }
    }

    return new Response(JSON.stringify({ success: true, message: 'Seed data created successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
