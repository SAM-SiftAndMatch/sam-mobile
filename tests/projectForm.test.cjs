/* global __dirname */
const { Buffer } = require('node:buffer');
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Load the app's plain JS modules without requiring a native runtime.
function moduleUrl(file) {
  const source = fs.readFileSync(file, 'utf8').replace(/from '([^']+)'/g, (_, specifier) => {
    const dependency = path.resolve(path.dirname(file), `${specifier}.js`);
    return `from '${moduleUrl(dependency)}'`;
  });
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const formModule = import(moduleUrl(path.resolve(__dirname, '../src/utils/projectForm.js')));
const serviceModule = import(moduleUrl(path.resolve(__dirname, '../src/services/mockService.js')));

test('required information and invalid VND amounts cannot advance', async () => {
  const { initialProjectForm, validateProjectStep } = await formModule;
  const form = initialProjectForm();
  assert.ok(validateProjectStep(form, 0).title);
  assert.ok(validateProjectStep(form, 0).description);
  for (const budget of ['', 'Infinity', '-1', '499999', '100000001', '500000.5']) {
    assert.ok(validateProjectStep({ ...form, budget }, 1).budget, budget);
  }
  for (const budget of ['500000', '1000000', '100000000']) {
    assert.deepEqual(validateProjectStep({ ...form, budget }, 1), {});
  }
});

test('review totals and deadline stay consistent with the submitted project', async () => {
  const { initialProjectForm, upgradeTotal, buildProjectPayload } = await formModule;
  const form = { ...initialProjectForm(), title: ' Thiết kế ứng dụng ', skills: 'Figma, UI/UX, ', upgrades: ['featured', 'urgent'] };
  assert.equal(upgradeTotal([]), 0);
  assert.equal(upgradeTotal(form.upgrades), 158000);
  const payload = buildProjectPayload(form, 'open', new Date(2026, 8, 28));
  assert.equal(payload.totalBudget, 1158000);
  assert.equal(payload.budget, 1000000);
  assert.equal(payload.currency, 'VND');
  assert.equal(payload.deadline, '2026-10-19');
  assert.deepEqual(payload.skills, ['Figma', 'UI/UX']);
  assert.equal(payload.title, 'Thiết kế ứng dụng');
});

test('service retains upgrades and currency; drafts reject proposals and published jobs accept them', async () => {
  const { initialProjectForm, buildProjectPayload } = await formModule;
  const service = await serviceModule;
  const form = { ...initialProjectForm(), title: 'Dự án kiểm thử', description: 'Thiết kế giao diện ứng dụng tài chính', upgrades: ['guarantee'] };
  const draft = await service.createJob({ ...buildProjectPayload(form, 'draft'), customerId: 'test-customer' });
  const stored = await service.getJobById(draft.id);
  assert.equal(stored.currency, 'VND');
  assert.equal(stored.upgradeFee, 59000);
  assert.equal(stored.totalBudget, 1059000);
  assert.deepEqual(stored.upgrades, ['guarantee']);
  await assert.rejects(service.createApplication({ jobId: draft.id, freelancerId: 'test-freelancer' }), /không nhận ứng tuyển/);
  await service.updateJob(draft.id, { status: 'open' });
  const application = await service.createApplication({ jobId: draft.id, freelancerId: 'test-freelancer', proposedPrice: 900000 });
  assert.equal(application.currency, 'VND');
  assert.equal(application.proposedPrice, 900000);
});
