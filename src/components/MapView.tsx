import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAP_CENTER, MAP_ZOOM, landmarks } from '@/data/plotData';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  price: number;
  listing_type: string;
  property_type: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  area: string | null;
  bedrooms: number;
  bathrooms: number;
  profiles?: { company_name: string | null; full_name: string | null; phone: string | null } | null;
}

interface MapViewProps {
  searchQuery: string;
  properties: Property[];
  onPropertySelect: (property: Property) => void;
}

const MapView = ({ searchQuery, properties, onPropertySelect }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { center: MAP_CENTER, zoom: MAP_ZOOM, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    landmarks.forEach((lm) => {
      const color = lm.type === 'park' ? '#16a34a' : lm.type === 'school' ? '#dc2626' : lm.type === 'mosque' ? '#7c3aed' : '#2563eb';
      const icon = L.divIcon({
        className: 'plot-label',
        html: `<div style="background:${color};color:#fff;padding:3px 10px;border-radius:4px;font-size:11px;font-weight:700;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,0.3);">${lm.name}</div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });
      L.marker([lm.lat, lm.lng], { icon, interactive: false }).addTo(map);
    });

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();

    const filtered = properties.filter(p => {
      if (!p.latitude || !p.longitude) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q) || p.area?.toLowerCase().includes(q);
    });

    filtered.forEach((prop) => {
      const color = prop.listing_type === 'buy' ? '#22c55e' : '#ea7a1d';
      const priceFormatted = prop.listing_type === 'rent'
        ? `PKR ${(prop.price / 1000).toFixed(0)}K/mo`
        : prop.price >= 10000000
          ? `PKR ${(prop.price / 10000000).toFixed(1)} Cr`
          : `PKR ${(prop.price / 100000).toFixed(1)} Lac`;

      const icon = L.divIcon({
        className: '',
        html: `<div class="price-marker ${prop.listing_type === 'buy' ? 'available' : 'reserved'}">${priceFormatted}</div>`,
        iconSize: [130, 28],
        iconAnchor: [65, 14],
      });

      const marker = L.marker([prop.latitude!, prop.longitude!], { icon }).addTo(markersRef.current!);
      const dealerPhone = prop.profiles?.phone || '923001234567';

      marker.bindPopup(`
        <div style="min-width:200px">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px">${prop.title}</div>
          <div style="font-size:12px;color:#666;margin-bottom:8px">${prop.location || ''}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:3px 10px;font-size:12px;">
            <span style="color:#888">Price:</span><span style="font-weight:700;color:${color}">${priceFormatted}</span>
            <span style="color:#888">Area:</span><span>${prop.area || 'N/A'}</span>
            <span style="color:#888">Type:</span><span>${prop.listing_type === 'buy' ? 'For Sale' : 'For Rent'}</span>
            ${prop.bedrooms > 0 ? `<span style="color:#888">Beds:</span><span>${prop.bedrooms}</span>` : ''}
          </div>
          <div style="margin-top:8px;font-size:11px;color:#888">${prop.profiles?.company_name || prop.profiles?.full_name || ''}</div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <a href="https://wa.me/${dealerPhone.replace(/[^0-9]/g, '')}?text=Interested in ${encodeURIComponent(prop.title)}" target="_blank" style="flex:1;text-align:center;padding:6px 0;background:#25d366;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">WhatsApp</a>
            <a href="tel:${dealerPhone}" style="flex:1;text-align:center;padding:6px 0;background:${color};color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">Call</a>
          </div>
        </div>
      `);

      marker.on('click', () => onPropertySelect(prop));
    });
  }, [searchQuery, properties, onPropertySelect]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
