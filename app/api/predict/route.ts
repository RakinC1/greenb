import { NextResponse } from 'next/server';
import { createRouteClient } from '@/lib/supabase-server';
import { predictWaste } from '@/lib/gemini';

// GET /api/predict — AI waste prediction for the authenticated restaurant
export async function GET() {
  const supabase = createRouteClient();

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Fetch 30-day listing history
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: history, error: histErr } = await supabase
    .from('listings')
    .select('name, category, quantity, unit, created_at, status')
    .eq('restaurant_id', user.id)
    .gte('created_at', thirtyDaysAgo);

  if (histErr) return NextResponse.json({ error: histErr.message }, { status: 400 });

  if (!history || history.length === 0) {
    return NextResponse.json({
      predictions: [],
      summary: 'Not enough history yet. Post more listings to unlock AI predictions.',
    });
  }

  try {
    const result = await predictWaste(history);

    // Persist predictions for analytics
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString().split('T')[0];
    await supabase.from('predictions').insert(
      result.predictions.map(p => ({
        restaurant_id:      user.id,
        predicted_category: p.category,
        predicted_qty:      p.estimated_qty,
        risk_level:         p.risk_level,
        confidence:         p.confidence,
        for_date:           tomorrow,
      }))
    );

    return NextResponse.json(result);
  } catch (err) {
    console.error('Gemini prediction error:', err);
    return NextResponse.json({ error: 'AI prediction failed' }, { status: 500 });
  }
}
