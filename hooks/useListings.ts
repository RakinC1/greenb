'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type { ListingWithProfile } from '@/types';

interface UseListingsOptions {
  restaurantId?: string;   // filter to one restaurant
  statusFilter?: string;   // 'available' | 'claimed' | 'expired'
  limit?: number;
}

export function useListings(options: UseListingsOptions = {}) {
  const supabase = createClient();
  const [listings, setListings] = useState<ListingWithProfile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('listings')
      .select('*, profiles(org_name, lat, lng, address)')
      .order('expires_at', { ascending: true });

    if (options.restaurantId) query = query.eq('restaurant_id', options.restaurantId);
    if (options.statusFilter) query = query.eq('status', options.statusFilter);
    else query = query.eq('status', 'available');
    if (options.limit)        query = query.limit(options.limit);

    const { data, error: err } = await query;
    if (err) setError(err.message);
    else setListings((data as ListingWithProfile[]) ?? []);
    setLoading(false);
  }, [options.restaurantId, options.statusFilter, options.limit]);

  useEffect(() => {
    fetchListings();

    // Real-time subscription
    const channel = supabase
      .channel('listings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchListings(); // refetch to get joined profile data
          }
          if (payload.eventType === 'UPDATE') {
            setListings(prev =>
              prev.map(l => l.id === payload.new.id ? { ...l, ...payload.new } : l)
            );
          }
          if (payload.eventType === 'DELETE') {
            setListings(prev => prev.filter(l => l.id !== payload.old.id));
          }
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchListings]);

  return { listings, loading, error, refetch: fetchListings };
}
