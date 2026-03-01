import { NextRequest, NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';

// POST /api/claims — claim a listing
export async function POST(req: NextRequest) {
  const supabase = createRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'shelter') {
    return NextResponse.json({ error: 'Only shelters can claim listings' }, { status: 403 });
  }

  const { listing_id, notes } = await req.json();
  if (!listing_id) return NextResponse.json({ error: 'listing_id required' }, { status: 400 });

  // Check listing is still available
  const { data: listing } = await supabase
    .from('listings').select('status').eq('id', listing_id).single();
  if (listing?.status !== 'available') {
    return NextResponse.json({ error: 'Listing is no longer available' }, { status: 409 });
  }

  // Create claim
  const { data: claim, error: claimErr } = await supabase
    .from('claims')
    .insert({ listing_id, shelter_id: user.id, notes: notes ?? null })
    .select()
    .single();
  if (claimErr) return NextResponse.json({ error: claimErr.message }, { status: 400 });

  // Mark listing as claimed
  await supabase.from('listings').update({ status: 'claimed' }).eq('id', listing_id);

  return NextResponse.json({ data: claim }, { status: 201 });
}

// GET /api/claims — get shelter's claims
export async function GET() {
  const supabase = createRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('claims')
    .select('*, listings(*, profiles(org_name, address))')
    .eq('shelter_id', user.id)
    .order('claimed_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
