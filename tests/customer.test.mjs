import test from 'node:test';
import assert from 'node:assert/strict';
import { addCompany, deleteCompany, distanceKm, filterCompanies, matchesKeyword, parseCsv, searchCompanies, seedCompanies, updateCompany } from '../.test-dist/customer.js';

test('searches companies by latitude, longitude, and radius', () => {
  const results = searchCompanies(seedCompanies, { latitude: 13.756331, longitude: 100.501762, radiusKm: 5 });
  assert.deepEqual(results.map((company) => company.id), ['bkk-001', 'bkk-002']);
  assert.ok(distanceKm(seedCompanies[0], seedCompanies[1]) < 5);
});

test('filters companies by English keyword without case sensitivity', () => {
  const results = filterCompanies(seedCompanies, { keyword: 'COLD CHAIN' });
  assert.deepEqual(results.map((company) => company.id), ['bkk-002']);
});

test('filters companies by Thai keyword across searchable fields', () => {
  assert.equal(matchesKeyword(seedCompanies[1], 'ติดตามอุณหภูมิ'), true);
  const results = filterCompanies(seedCompanies, { keyword: 'อุปกรณ์ความปลอดภัย' });
  assert.deepEqual(results.map((company) => company.id), ['hkt-001']);
});

test('combines keyword with latitude, longitude, and radius filters', () => {
  const results = filterCompanies(seedCompanies, { keyword: 'software', point: { latitude: 13.756331, longitude: 100.501762, radiusKm: 5 } });
  assert.deepEqual(results.map((company) => company.id), ['bkk-002']);
});

test('adds, edits, deletes, and imports CSV companies', () => {
  const imported = parseCsv('name,category,latitude,longitude,address,website,email,phone,product_interest,notes\nTest Co,Tech,13.7,100.5,Bangkok,https://test.example,sales@test.example,123,Widgets,Follow up');
  let companies = addCompany(seedCompanies, imported[0]);
  assert.equal(companies.at(-1).name, 'Test Co');
  assert.equal(companies.at(-1).productInterest, 'Widgets');
  companies = updateCompany(companies, { ...companies.at(-1), id: companies.at(-1).id, name: 'Updated Co' });
  assert.equal(companies.at(-1).name, 'Updated Co');
  companies = deleteCompany(companies, companies.at(-1).id);
  assert.equal(companies.length, seedCompanies.length);
});
