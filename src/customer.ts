export interface Company {
  id: string;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  address: string;
  website?: string;
  email?: string;
  phone?: string;
  productInterest?: string;
  notes?: string;
}

export interface SearchPoint {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export interface CompanyFilters {
  point?: SearchPoint;
  keyword?: string;
}

const EARTH_RADIUS_KM = 6371;

export const seedCompanies: Company[] = [
  { id: 'bkk-001', name: 'Bangkok Precision Parts', category: 'Manufacturing', latitude: 13.756331, longitude: 100.501762, address: 'Pathum Wan, Bangkok', website: 'https://bangkok-precision.example', email: 'sales@bangkok-precision.example', phone: '+66 2 111 0001', productInterest: 'CNC machine parts', notes: 'Interested in precision steel components' },
  { id: 'bkk-002', name: 'Siam Fresh Logistics', category: 'Logistics', latitude: 13.736717, longitude: 100.523186, address: 'Sathon, Bangkok', website: 'https://siamfresh.example', email: 'contact@siamfresh.example', phone: '+66 2 222 0002', productInterest: 'Cold chain software', notes: 'ต้องการระบบติดตามอุณหภูมิ' },
  { id: 'cnx-001', name: 'Chiang Mai Digital Studio', category: 'Technology', latitude: 18.788344, longitude: 98.9853, address: 'Mueang Chiang Mai', website: 'https://cnx-digital.example', email: 'hello@cnx-digital.example', phone: '+66 53 333 003', productInterest: 'Marketing automation', notes: 'Prefers English proposal' },
  { id: 'hkt-001', name: 'Phuket Marine Supplies', category: 'Marine', latitude: 7.880448, longitude: 98.39225, address: 'Mueang Phuket', website: 'https://phuketmarine.example', email: 'info@phuketmarine.example', phone: '+66 76 444 004', productInterest: 'Marine safety equipment', notes: 'ลูกค้าสนใจอุปกรณ์ความปลอดภัย' }
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

const keywordFields: Array<keyof Pick<Company, 'name' | 'website' | 'email' | 'phone' | 'productInterest' | 'notes'>> = ['name', 'website', 'email', 'phone', 'productInterest', 'notes'];

export function matchesKeyword(company: Company, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLocaleLowerCase();
  if (!normalizedKeyword) return true;
  return keywordFields.some((field) => (company[field] ?? '').toLocaleLowerCase().includes(normalizedKeyword));
}

export function searchCompanies(companies: Company[], point: SearchPoint): Company[] {
  return filterCompanies(companies, { point });
}

export function filterCompanies(companies: Company[], filters: CompanyFilters = {}): Company[] {
  const { point, keyword = '' } = filters;
  const withDistance = companies.map((company) => ({ company, distance: point ? distanceKm(company, point) : 0 }));
  return withDistance
    .filter((item) => (!point || item.distance <= point.radiusKm) && matchesKeyword(item.company, keyword))
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
      address: get('address'),
      website: get('website'),
      email: get('email'),
      phone: get('phone'),
      productInterest: get('productinterest') || get('product_interest') || get('product interest'),
      notes: get('notes')
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
