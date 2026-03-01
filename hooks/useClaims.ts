'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { Claim } from '@/types';

export function useClaims(shelterId?: string) {
  const supabase = createClient();
  const [claims, setClaims]   = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = useCallback(async () => {
    if (!shelterId) { setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from('claims')
      .select('*, listings(*, profiles(org_name, address))')
      .eq('shelter_id', shelterId)
      .order('claimed_at', { ascending: false });

    setClaims((data as Claim[]) ?? []);
    setLoading(false);
  }, [shelterId]);

  useEffect(() => {
    fetchClaims();

    const channel = supabase
      .channel('claims-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' },
        () => fetchClaims())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchClaims]);

  async function claimListing(listingId: string, shelterId: string, notes?: string) {
    const { error } = await supabase.from('claims').insert({
      listing_id: listingId,
      shelter_id: shelterId,
      notes: notes ?? null,
    });

    if (!error) {
      // Mark listing as claimed
      await supabase
        .from('listings')
        .update({ status: 'claimed' })
        .eq('id', listingId);
    }

    return { error };
  }

  async function confirmPickup(claimId: string) {
    const { error } = await supabase
      .from('claims')
      .update({ pickup_confirmed: true })
      .eq('id', claimId);
    if (!error) fetchClaims();
    return { error };
  }

  return { claims, loading, claimListing, confirmPickup, refetch: fetchClaims };
}
