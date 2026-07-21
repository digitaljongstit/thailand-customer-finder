import test from 'node:test';
import assert from 'node:assert/strict';
import { addCompany, deleteCompany, distanceKm, parseCsv, searchCompanies, seedCompanies, updateCompany } from '../.test-dist/customer.js';

test('searches companies by latitude, longitude, and radius', () => {
  const results = searchCompanies(seedCompanies, { latitude: 13.756331, longitude: 100.501762, radiusKm: 5 });
  assert.deepEqual(results.map((company) => company.id), ['bkk-001', 'bkk-002']);
  assert.ok(distanceKm(seedCompanies[0], seedCompanies[1]) < 5);
});

test('adds, edits, deletes, and imports CSV companies', () => {
  const imported = parseCsv('name,category,latitude,longitude,address\nTest Co,Tech,13.7,100.5,Bangkok');
  let companies = addCompany(seedCompanies, imported[0]);
  assert.equal(companies.at(-1).name, 'Test Co');
  companies = updateCompany(companies, { ...companies.at(-1), id: companies.at(-1).id, name: 'Updated Co' });
  assert.equal(companies.at(-1).name, 'Updated Co');
  companies = deleteCompany(companies, companies.at(-1).id);
  assert.equal(companies.length, seedCompanies.length);
});
