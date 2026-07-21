export interface Company {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
}

export interface SearchPoint {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

const EARTH_RADIUS_KM = 6371;

export const seedCompanies: Company[] = [
  { id: 'bkk-001', name: 'Bangkok Precision Parts', category: 'Manufacturing', latitude: 13.756331, longitude: 100.501762, address: 'Pathum Wan, Bangkok' },
  { id: 'bkk-002', name: 'Siam Fresh Logistics', category: 'Logistics', latitude: 13.736717, longitude: 100.523186, address: 'Sathon, Bangkok' },
  { id: 'cnx-001', name: 'Chiang Mai Digital Studio', category: 'Technology', latitude: 18.788344, longitude: 98.9853, address: 'Mueang Chiang Mai' },
  { id: 'hkt-001', name: 'Phuket Marine Supplies', category: 'Marine', latitude: 7.880448, longitude: 98.39225, address: 'Mueang Phuket' }
];

export function distanceKm(a: Pick<Company, 'latitude' | 'longitude'>, b: Pick<Company, 'latitude' | 'longitude'>): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function searchCompanies(companies: Company[], point: SearchPoint): Company[] {
  return companies
    .map((company) => ({ company, distance: distanceKm(company, point) }))
    .filter((item) => item.distance <= point.radiusKm)
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.company);
}

export function parseCsv(text: string): Company[] {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim().toLowerCase());
  const required = ['name', 'category', 'latitude', 'longitude', 'address'];
  for (const field of required) {
    if (!headers.includes(field)) throw new Error(`CSV missing required column: ${field}`);
  }
  return lines.filter(Boolean).map((line, index) => {
    const values = line.split(',').map((value) => value.trim());
    const get = (field: string) => values[headers.indexOf(field)] ?? '';
    return {
      id: get('id') || `csv-${Date.now()}-${index}`,
      name: get('name'),
      category: get('category'),
      latitude: Number(get('latitude')),
      longitude: Number(get('longitude')),
      address: get('address')
    };
  });
}

export function addCompany(companies: Company[], company: Company): Company[] {
  return [...companies, company];
}

export function updateCompany(companies: Company[], company: Company): Company[] {
  return companies.map((item) => (item.id === company.id ? company : item));
}

export function deleteCompany(companies: Company[], id: string): Company[] {
  return companies.filter((item) => item.id !== id);
}
