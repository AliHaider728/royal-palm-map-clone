import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { plotData, MAP_CENTER, MAP_ZOOM, landmarks, type PlotData } from '@/data/plotData';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusColors: Record<string, string> = {
  available: '#22c55e',
  sold: '#ef4444',
  reserved: '#f59e0b',
  commercial: '#3b82f6',
};

interface MapViewProps {
  searchQuery: string;
  selectedBlock: string | null;
  onPlotSelect: (plot: PlotData) => void;
}

const MapView = ({ searchQuery, selectedBlock, onPlotSelect }: MapViewProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      zoomControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);

    // Add landmarks
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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when filters change
  useEffect(() => {
    if (!markersRef.current || !mapRef.current) return;
    markersRef.current.clearLayers();

    const filteredPlots = plotData.filter((plot) => {
      const matchesSearch = !searchQuery || 
        plot.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.plotNumber.includes(searchQuery) ||
        plot.size.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plot.price.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBlock = !selectedBlock || plot.block === selectedBlock;
      return matchesSearch && matchesBlock;
    });

    filteredPlots.forEach((plot) => {
      const color = statusColors[plot.status];
      const icon = L.divIcon({
        className: '',
        html: `<div class="price-marker ${plot.status}">${plot.size} @ ${plot.price}</div>`,
        iconSize: [140, 28],
        iconAnchor: [70, 14],
      });

      const marker = L.marker([plot.lat, plot.lng], { icon }).addTo(markersRef.current!);
      
      marker.bindPopup(`
        <div style="min-width:180px">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:${color}">Block ${plot.block} - Plot ${plot.plotNumber}</div>
          <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:13px;">
            <span style="color:#888">Size:</span><span style="font-weight:600">${plot.size}</span>
            <span style="color:#888">Price:</span><span style="font-weight:600">${plot.price}</span>
            <span style="color:#888">Status:</span><span style="font-weight:600;color:${color}">${plot.status.charAt(0).toUpperCase() + plot.status.slice(1)}</span>
          </div>
          <div style="margin-top:10px;display:flex;gap:6px">
            <a href="#" style="flex:1;text-align:center;padding:6px 0;background:${color};color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">Inquire</a>
            <a href="https://wa.me/923001234567?text=Interested in Block ${plot.block} Plot ${plot.plotNumber}" target="_blank" style="flex:1;text-align:center;padding:6px 0;background:#25d366;color:#fff;border-radius:6px;text-decoration:none;font-size:12px;font-weight:600">WhatsApp</a>
          </div>
        </div>
      `);

      marker.on('click', () => onPlotSelect(plot));
    });
  }, [searchQuery, selectedBlock, onPlotSelect]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default MapView;
