import type { Company } from './customer.js';
import { addCompany, deleteCompany, parseCsv, searchCompanies, seedCompanies, updateCompany } from './customer.js';

declare global {
  interface Window { L?: any; }
}

let companies: Company[] = [...seedCompanies];
let activeResults: Company[] = companies;
let map: any;
let markerLayer: any;

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

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

function renderList(): void {
  const list = $('company-list');
  list.innerHTML = activeResults.map((company) => `<article class="company-card"><h3>${company.name}</h3><p>${company.category} · ${company.address}</p><p>${company.latitude.toFixed(6)}, ${company.longitude.toFixed(6)}</p><button data-edit="${company.id}">แก้ไข</button><button data-delete="${company.id}">ลบ</button></article>`).join('') || '<p>ไม่พบบริษัทในเงื่อนไขนี้</p>';
  renderMap(activeResults);
}

function upsertCompany(company: Company): void {
  const existingIndex = companies.findIndex((item) => item.id === company.id);
  companies = existingIndex >= 0 ? updateCompany(companies, company) : addCompany(companies, company);
  activeResults = companies;
  renderList();
}

$('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  activeResults = searchCompanies(companies, { latitude: Number(($('latitude') as HTMLInputElement).value), longitude: Number(($('longitude') as HTMLInputElement).value), radiusKm: Number(($('radius') as HTMLInputElement).value) });
  $('status').textContent = `พบ ${activeResults.length} บริษัท`;
  renderList();
});

$('company-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const idInput = $('company-id') as HTMLInputElement;
  upsertCompany({ id: idInput.value || crypto.randomUUID(), name: ($('company-name') as HTMLInputElement).value, category: ($('company-category') as HTMLInputElement).value, latitude: Number(($('company-latitude') as HTMLInputElement).value), longitude: Number(($('company-longitude') as HTMLInputElement).value), address: ($('company-address') as HTMLInputElement).value });
  (event.currentTarget as HTMLFormElement).reset();
  idInput.value = '';
  $('status').textContent = 'บันทึกข้อมูลบริษัทแล้ว';
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
  }
  if (deleteId) {
    companies = deleteCompany(companies, deleteId);
    activeResults = activeResults.filter((item) => item.id !== deleteId);
    $('status').textContent = 'ลบข้อมูลบริษัทแล้ว';
    renderList();
  }
});

$('reset-form').addEventListener('click', () => ($('company-form') as HTMLFormElement).reset());
$('csv-file').addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const imported = parseCsv(await file.text());
  companies = [...companies, ...imported];
  activeResults = companies;
  $('status').textContent = `นำเข้า ${imported.length} บริษัทจาก CSV แล้ว`;
  renderList();
});

initMap();
renderList();
