import type { Company, SearchPoint } from './customer.js';
import { addCompany, deleteCompany, filterCompanies, parseCsv, seedCompanies, updateCompany } from './customer.js';

declare global {
  interface Window { L?: any; }
}

let companies: Company[] = [...seedCompanies];
let activeResults: Company[] = companies;
let activePoint: SearchPoint | undefined;
let map: any;
let markerLayer: any;

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const inputValue = (id: string): string => ($(id) as HTMLInputElement).value;

function initMap(): void {
  if (!window.L) {
    $('status').textContent = 'Leaflet ยังโหลดไม่สำเร็จ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    return;
  }
  map = window.L.map('map').setView([13.756331, 100.501762], 6);
  window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
  markerLayer = window.L.layerGroup().addTo(map);
  renderMap(companies);
}

function renderMap(items: Company[]): void {
  if (!map || !markerLayer) return;
  markerLayer.clearLayers();
  const bounds: any[] = [];
  for (const company of items) {
    const marker = window.L.marker([company.latitude, company.longitude]).bindPopup(`<strong>${company.name}</strong><br>${company.category}<br>${company.address}`);
    marker.addTo(markerLayer);
    bounds.push([company.latitude, company.longitude]);
  }
  if (bounds.length > 0) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
}

function companyDetails(company: Company): string {
  const rows = [
    ['Website', company.website],
    ['Email', company.email],
    ['Phone', company.phone],
    ['Product Interest', company.productInterest],
    ['Notes', company.notes]
  ].filter(([, value]) => value);
  return rows.length ? `<dl>${rows.map(([label, value]) => `<dt>${label}</dt><dd>${value}</dd>`).join('')}</dl>` : '';
}

function applyFilters(statusMessage?: string): void {
  activeResults = filterCompanies(companies, { point: activePoint, keyword: inputValue('keyword') });
  $('result-count').textContent = `แสดง ${activeResults.length} ผลลัพธ์`;
  if (statusMessage) $('status').textContent = statusMessage;
  renderList();
}

function renderList(): void {
  const list = $('company-list');
  list.innerHTML = activeResults.map((company) => `<article class="company-card"><h3>${company.name}</h3><p>${company.category} · ${company.address}</p><p>${company.latitude.toFixed(6)}, ${company.longitude.toFixed(6)}</p>${companyDetails(company)}<button data-edit="${company.id}">แก้ไข</button><button data-delete="${company.id}">ลบ</button></article>`).join('') || '<p class="empty-results">ไม่พบข้อมูลที่ตรงกับเงื่อนไขการค้นหา</p>';
  renderMap(activeResults);
}

function upsertCompany(company: Company): void {
  const existingIndex = companies.findIndex((item) => item.id === company.id);
  companies = existingIndex >= 0 ? updateCompany(companies, company) : addCompany(companies, company);
  applyFilters('บันทึกข้อมูลบริษัทแล้ว');
}

$('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  activePoint = { latitude: Number(inputValue('latitude')), longitude: Number(inputValue('longitude')), radiusKm: Number(inputValue('radius')) };
  applyFilters();
  $('status').textContent = `พบ ${activeResults.length} บริษัท`;
});

$('keyword').addEventListener('input', () => applyFilters());
$('clear-search').addEventListener('click', () => {
  ($('keyword') as HTMLInputElement).value = '';
  applyFilters('ล้างคำค้นหาแล้ว');
});

$('company-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const idInput = $('company-id') as HTMLInputElement;
  upsertCompany({ id: idInput.value || crypto.randomUUID(), name: inputValue('company-name'), category: inputValue('company-category'), latitude: Number(inputValue('company-latitude')), longitude: Number(inputValue('company-longitude')), address: inputValue('company-address'), website: inputValue('company-website'), email: inputValue('company-email'), phone: inputValue('company-phone'), productInterest: inputValue('company-product-interest'), notes: inputValue('company-notes') });
  (event.currentTarget as HTMLFormElement).reset();
  idInput.value = '';
});

$('company-list').addEventListener('click', (event) => {
  const target = event.target as HTMLButtonElement;
  const editId = target.dataset.edit;
  const deleteId = target.dataset.delete;
  if (editId) {
    const company = companies.find((item) => item.id === editId);
    if (!company) return;
    ($('company-id') as HTMLInputElement).value = company.id;
    ($('company-name') as HTMLInputElement).value = company.name;
    ($('company-category') as HTMLInputElement).value = company.category;
    ($('company-latitude') as HTMLInputElement).value = String(company.latitude);
    ($('company-longitude') as HTMLInputElement).value = String(company.longitude);
    ($('company-address') as HTMLInputElement).value = company.address;
    ($('company-website') as HTMLInputElement).value = company.website ?? '';
    ($('company-email') as HTMLInputElement).value = company.email ?? '';
    ($('company-phone') as HTMLInputElement).value = company.phone ?? '';
    ($('company-product-interest') as HTMLInputElement).value = company.productInterest ?? '';
    ($('company-notes') as HTMLTextAreaElement).value = company.notes ?? '';
  }
  if (deleteId) {
    companies = deleteCompany(companies, deleteId);
    applyFilters('ลบข้อมูลบริษัทแล้ว');
  }
});

$('reset-form').addEventListener('click', () => ($('company-form') as HTMLFormElement).reset());
$('csv-file').addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const imported = parseCsv(await file.text());
  companies = [...companies, ...imported];
  applyFilters(`นำเข้า ${imported.length} บริษัทจาก CSV แล้ว`);
});

initMap();
applyFilters();
