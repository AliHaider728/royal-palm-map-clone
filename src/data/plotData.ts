export type PlotStatus = 'available' | 'sold' | 'reserved' | 'commercial';

export interface PlotData {
  id: string;
  plotNumber: string;
  block: string;
  size: string;
  price: string;
  status: PlotStatus;
  lat: number;
  lng: number;
}

// Royal Palm City Gujranwala approximate coordinates: 32.1617, 74.1868
const CENTER_LAT = 32.1617;
const CENTER_LNG = 74.1868;

function offset(baseLat: number, baseLng: number, dLat: number, dLng: number): [number, number] {
  return [baseLat + dLat * 0.001, baseLng + dLng * 0.001];
}

export const plotData: PlotData[] = [
  // Block A
  ...generateBlock('A', CENTER_LAT - 0.004, CENTER_LNG - 0.002, 'available', [
    { num: '1', size: '5 marla', price: '34.50 Lakh', dLat: 0, dLng: 0 },
    { num: '2', size: '5 marla', price: '37.50 Lakh', dLat: 0.3, dLng: 0.2 },
    { num: '3', size: '10 marla', price: '1.00 Crore', dLat: 0.6, dLng: 0.0 },
    { num: '4', size: '5 marla', price: '38.00 Lakh', dLat: 0.1, dLng: 0.5 },
    { num: '5', size: '10 marla', price: '1.15 Crore', dLat: 0.4, dLng: 0.6 },
    { num: '6', size: '6 marla', price: '85.00 Lakh', dLat: 0.7, dLng: 0.3 },
    { num: '7', size: '10 marla', price: '58.00 Lakh', dLat: 0.9, dLng: 0.1 },
  ]),
  // Block B
  ...generateBlock('B', CENTER_LAT - 0.001, CENTER_LNG + 0.001, 'available', [
    { num: '1', size: '1 kanal', price: '2.80 Crore', dLat: 0, dLng: 0 },
    { num: '2', size: '1 kanal', price: '3.00 Crore', dLat: 0.3, dLng: 0.1 },
    { num: '3', size: '1 kanal', price: '2.75 Crore', dLat: 0.5, dLng: -0.1 },
    { num: '4', size: '10 marla', price: '1.20 Crore', dLat: 0.1, dLng: 0.4 },
    { num: '5', size: '10 marla', price: '1.25 Crore', dLat: 0.4, dLng: 0.5 },
  ]),
  // Block C
  ...generateBlock('C', CENTER_LAT + 0.002, CENTER_LNG - 0.003, 'reserved', [
    { num: '1', size: '5 marla', price: '59.00 Lakh', dLat: 0, dLng: 0 },
    { num: '2', size: '5 marla', price: '65.00 Lakh', dLat: 0.2, dLng: 0.3 },
    { num: '3', size: '10 marla', price: '1.15 Crore', dLat: 0.5, dLng: 0.1 },
    { num: '4', size: '5 marla', price: '72.00 Lakh', dLat: 0.3, dLng: 0.6 },
    { num: '5', size: '10 marla', price: '1.20 Crore', dLat: 0.7, dLng: 0.4 },
    { num: '6', size: '10 marla', price: '1.15 Crore', dLat: 0.9, dLng: 0.2 },
  ]),
  // Block D
  ...generateBlock('D', CENTER_LAT + 0.001, CENTER_LNG + 0.003, 'sold', [
    { num: '1', size: '5 marla', price: '50.00 Lakh', dLat: 0, dLng: 0 },
    { num: '2', size: '5 marla', price: '45.50 Lakh', dLat: 0.2, dLng: 0.2 },
    { num: '3', size: '10 marla', price: '1.22 Crore', dLat: 0.5, dLng: 0.0 },
    { num: '4', size: '5 marla', price: '39.00 Lakh', dLat: 0.3, dLng: 0.5 },
    { num: '5', size: '10 marla', price: '1.08 Crore', dLat: 0.7, dLng: 0.3 },
  ]),
  // Block E
  ...generateBlock('E', CENTER_LAT + 0.004, CENTER_LNG + 0.000, 'available', [
    { num: '1', size: '5 marla', price: '60.00 Lakh', dLat: 0, dLng: 0 },
    { num: '2', size: '5 marla', price: '60.00 Lakh', dLat: 0.2, dLng: 0.3 },
    { num: '3', size: '11 marla', price: '1.45 Crore', dLat: 0.4, dLng: 0.1 },
    { num: '4', size: '5 marla', price: '49.00 Lakh', dLat: 0.1, dLng: 0.6 },
    { num: '5', size: '11 marla', price: '1.25 Crore', dLat: 0.6, dLng: 0.5 },
  ]),
  // Block F (commercial)
  ...generateBlock('F', CENTER_LAT + 0.003, CENTER_LNG - 0.005, 'commercial', [
    { num: '1', size: '10 marla', price: '1.30 Crore', dLat: 0, dLng: 0 },
    { num: '2', size: '10 marla', price: '1.30 Crore', dLat: 0.3, dLng: 0.2 },
    { num: '3', size: '10 marla', price: '1.00 Crore', dLat: 0.6, dLng: 0.0 },
    { num: '4', size: '11 marla', price: '85.00 Lakh', dLat: 0.2, dLng: 0.5 },
  ]),
  // Block G
  ...generateBlock('G', CENTER_LAT + 0.005, CENTER_LNG + 0.004, 'available', [
    { num: '1', size: '5 marla', price: '40.00 Lakh', dLat: 0, dLng: 0 },
    { num: '2', size: '10 marla', price: '85.00 Lakh', dLat: 0.3, dLng: 0.2 },
    { num: '3', size: '5 marla', price: '34.00 Lakh', dLat: 0.6, dLng: 0.0 },
    { num: '4', size: '5 marla', price: '37.50 Lakh', dLat: 0.1, dLng: 0.5 },
  ]),
  // Block H - Park area
  ...generateBlock('H', CENTER_LAT + 0.006, CENTER_LNG - 0.001, 'reserved', [
    { num: '1', size: '20 marla', price: '2.50 Crore', dLat: 0, dLng: 0 },
    { num: '2', size: '10 marla', price: '1.30 Crore', dLat: 0.4, dLng: 0.3 },
  ]),
];

function generateBlock(
  block: string,
  baseLat: number,
  baseLng: number,
  defaultStatus: PlotStatus,
  plots: { num: string; size: string; price: string; dLat: number; dLng: number }[]
): PlotData[] {
  return plots.map((p) => {
    const [lat, lng] = offset(baseLat, baseLng, p.dLat, p.dLng);
    return {
      id: `${block}-${p.num}`,
      plotNumber: p.num,
      block,
      size: p.size,
      price: p.price,
      status: defaultStatus,
      lat,
      lng,
    };
  });
}

export const MAP_CENTER: [number, number] = [CENTER_LAT, CENTER_LNG];
export const MAP_ZOOM = 15;

export const landmarks = [
  { name: 'PARK', lat: CENTER_LAT - 0.001, lng: CENTER_LNG - 0.001, type: 'park' as const },
  { name: 'SCHOOL', lat: CENTER_LAT - 0.004, lng: CENTER_LNG - 0.004, type: 'school' as const },
  { name: 'MOSQUE', lat: CENTER_LAT + 0.002, lng: CENTER_LNG + 0.002, type: 'mosque' as const },
  { name: 'G PARK', lat: CENTER_LAT + 0.005, lng: CENTER_LNG + 0.003, type: 'park' as const },
  { name: 'COMMERCIAL', lat: CENTER_LAT + 0.003, lng: CENTER_LNG - 0.005, type: 'commercial' as const },
];
