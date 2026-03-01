import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getEquivalences } from '@/lib/impact';

// GET /api/impact — aggregate platform stats
export async function GET() {
  const supabase = createAdminClient();

  const { data: listings } = await supabase
    .from('listings')
    .select('co2_saved, water_saved, quantity, unit')
    .eq('status', 'claimed');

  const { count: rescues }     = await supabase.from('claims').select('*', { count: 'exact', head: true });
  const { count: restaurants } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'restaurant');
  const { count: shelters }    = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'shelter');

  const totalCO2   = listings?.reduce((sum, l) => sum + (l.co2_saved ?? 0), 0) ?? 0;
  const totalWater = listings?.reduce((sum, l) => sum + (l.water_saved ?? 0), 0) ?? 0;
  const totalMeals = Math.floor(listings?.reduce((sum, l) => sum + (l.quantity ?? 0), 0) ?? 0);

  const equiv = getEquivalences(totalCO2, totalWater);

  return NextResponse.json({
    data: {
      total_meals:         totalMeals,
      total_co2:           parseFloat(totalCO2.toFixed(2)),
      total_water:         Math.round(totalWater),
      total_rescues:       rescues ?? 0,
      active_restaurants:  restaurants ?? 0,
      active_shelters:     shelters ?? 0,
      equivalences:        equiv,
    },
  });
}
