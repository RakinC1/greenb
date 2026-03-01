'use client';
import { useEffect, useRef } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/mapbox';

interface MapListing {
  id: string;
  lat: number;
  lng: number;
  name: string;
  status: string;
}

interface MapViewProps {
  listings: MapListing[];
  onListingClick?: (id: string) => void;
  height?: number;
}

export function MapView({ listings, onListingClick, height = 400 }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined') return;

    // Dynamically import mapbox-gl to avoid SSR issues
    import('mapbox-gl').then(({ default: mapboxgl }) => {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      if (mapRef.current) return; // already initialized

      const map = new mapboxgl.Map({
        container: containerRef.current!,
        style:     'mapbox://styles/mapbox/light-v11',
        center:    DEFAULT_CENTER,
        zoom:      DEFAULT_ZOOM,
      });

      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.on('load', () => {
        // Food listing markers
        listings.forEach(l => {
          const el = document.createElement('div');
          el.style.cssText = `
            width:34px; height:34px; background:#4a7c59; border-radius:50%;
            border:2.5px solid white; cursor:pointer; display:flex;
            align-items:center; justify-content:center; font-size:15px;
            box-shadow:0 2px 10px rgba(26,46,26,0.25);
          `;
          el.innerHTML = '🍽';
          if (onListingClick) el.addEventListener('click', () => onListingClick(l.id));

          new mapboxgl.Marker(el)
            .setLngLat([l.lng, l.lat])
            .setPopup(
              new mapboxgl.Popup({ offset: 20 }).setHTML(
                `<strong style="font-size:13px">${l.name}</strong>
                 <br/><span style="color:#4a7c59;font-size:11px">${l.status}</span>`
              )
            )
            .addTo(map);
        });

        // Heatmap for waste density
        if (listings.length > 0) {
          map.addSource('waste-heat', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: listings.map(l => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [l.lng, l.lat] },
                properties: { weight: 1 },
              })),
            },
          });

          map.addLayer({
            id: 'waste-heatmap',
            type: 'heatmap',
            source: 'waste-heat',
            paint: {
              'heatmap-color': [
                'interpolate', ['linear'], ['heatmap-density'],
                0, 'rgba(74,124,89,0)',
                0.5, 'rgba(168,213,181,0.55)',
                1, 'rgba(232,168,53,0.75)',
              ],
              'heatmap-radius': 35,
              'heatmap-opacity': 0.65,
            },
          });
        }
      });
    });

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height }}
      className="rounded-2xl overflow-hidden"
    />
  );
}
