/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { moduleUrl } = require('./helpers/loadAppModule.cjs');
const sessionModule = import(moduleUrl(path.resolve(__dirname, '../src/lib/session.ts')));
const gateModule = import(moduleUrl(path.resolve(__dirname, '../src/lib/requestGate.ts')));
const user = { id: 'a', name: 'Alice', email: 'alice@example.com', role: 'customer' };

test('public sessions remove credentials and validate persisted profile shapes', async () => {
  const { publicUser } = await sessionModule;
  const safe = publicUser({
    ...user,
    password: 'secret',
    accessToken: 'not-a-profile-field',
    skills: ['React', 123],
    portfolio: [{ id: 'p', title: 'Work', link: 'https://example.com', password: 'secret' }, {}],
  });
  assert.equal('password' in safe, false);
  assert.equal('accessToken' in safe, false);
  assert.deepEqual(safe.skills, ['React']);
  assert.deepEqual(safe.portfolio, [{ id: 'p', title: 'Work', link: 'https://example.com' }]);
  assert.throws(() => publicUser({ ...user, role: 'admin' }), /không hợp lệ/);
  assert.throws(() => publicUser(null), /không hợp lệ/);
});

test('a slow session save completes before a queued logout removes it', async () => {
  const { createSessionStorage } = await sessionModule;
  let value = null;
  let release;
  const blocked = new Promise((resolve) => {
    release = resolve;
  });
  const storage = createSessionStorage({
    getItem: async () => value,
    setItem: async (_, next) => {
      await blocked;
      value = next;
    },
    removeItem: async () => {
      value = null;
    },
  });
  const save = storage.write(user);
  const logout = storage.write(null);
  release();
  await Promise.all([save, logout]);
  assert.equal(await storage.read(), null);
});

test('a failed persistence write does not block a later logout', async () => {
  const { createSessionStorage } = await sessionModule;
  let removed = false;
  const storage = createSessionStorage({
    getItem: async () => null,
    setItem: async () => {
      throw new Error('disk full');
    },
    removeItem: async () => {
      removed = true;
    },
  });
  await assert.rejects(storage.write(user), /disk full/);
  await storage.write(null);
  assert.equal(removed, true);
});

test('older reads cannot overwrite a refresh, and remount invalidates all old tickets', async () => {
  const { createRequestGate } = await gateModule;
  const gate = createRequestGate();
  const first = gate.begin();
  const second = gate.begin();
  assert.equal(gate.isCurrent(first), false);
  assert.equal(gate.isCurrent(second), true);
  const chat = gate.begin('chat');
  assert.equal(gate.isCurrent(second), true);
  gate.dispose();
  assert.equal(gate.isCurrent(chat), false);
  gate.activate();
  assert.equal(gate.isCurrent(second), false);
  assert.equal(gate.isCurrent(gate.begin()), true);
});
