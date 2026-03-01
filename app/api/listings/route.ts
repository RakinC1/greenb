import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { computeImpact } from '@/lib/impact';

// GET /api/listings — fetch available listings
export async function GET(req: NextRequest) {
  const supabase   = createRouteClient();
  const { searchParams } = req.nextUrl;
  const status     = searchParams.get('status')     ?? 'available';
  const category   = searchParams.get('category');
  const restaurant = searchParams.get('restaurant');

  let query = supabase
    .from('listings')
    .select('*, profiles(org_name, lat, lng, address)')
    .eq('status', status)
    .order('expires_at', { ascending: true });

  if (category)   query = query.eq('category', category);
  if (restaurant) query = query.eq('restaurant_id', restaurant);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

// POST /api/listings — create new listing
export async function POST(req: NextRequest) {
  const supabase = createRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only restaurants can create listings
  const { data: profile } = await supabase
    .from('profiles').select('role, lat, lng').eq('id', user.id).single();
  if (profile?.role !== 'restaurant') {
    return NextResponse.json({ error: 'Only restaurants can post listings' }, { status: 403 });
  }

  const body = await req.json();
  const impact = computeImpact(body.category, body.quantity, body.unit);

  const { data, error } = await supabase
    .from('listings')
    .insert({
      restaurant_id: user.id,
      name:          body.name,
      category:      body.category,
      quantity:      body.quantity,
      unit:          body.unit,
      dietary_tags:  body.dietary_tags ?? [],
      photo_url:     body.photo_url ?? null,
      expires_at:    body.expires_at,
      lat:           profile?.lat ?? null,
      lng:           profile?.lng ?? null,
      co2_saved:     impact.co2,
      water_saved:   impact.water,
      status:        'available',
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}
