const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function response(status, result, code = 1000) {
  return {
    status,
    json: async () => ({ code, result, message: status === 401 ? 'Hết phiên' : 'ok' }),
  };
}
function auth(id, token = `access-${id}`) {
  return {
    accessToken: token,
    userId: id,
    fullName: `User ${id}`,
    email: `${id}@example.test`,
    role: 'FREELANCER',
  };
}
function load(fetch, base = 'https://api.example.test') {
  const exports = {};
  const storage = new Map();
  const paymentExports = {};
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/services/payment-idempotency.ts', 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
    { exports: paymentExports, module: { exports: paymentExports } },
  );
  const code = ts.transpileModule(fs.readFileSync('src/services/api/client.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    exports,
    module: { exports },
    require: (name) => {
      if (name === 'react-native') return { Platform: { OS: 'ios' } };
      if (name === '../payment-idempotency') return paymentExports;
      if (name === '@react-native-async-storage/async-storage')
        return {
          __esModule: true,
          default: {
            getItem: async (k) => storage.get(k) || null,
            setItem: async (k, v) => storage.set(k, v),
            removeItem: async (k) => storage.delete(k),
          },
        };
      throw new Error(name);
    },
    fetch,
    process: {
      env: { EXPO_PUBLIC_API_URL: base, EXPO_PUBLIC_AUTH_ORIGIN: 'https://app.example.test' },
    },
    __DEV__: false,
    AbortController,
    setTimeout,
    clearTimeout,
    Promise,
    Set,
  });
  return exports;
}
test('production disallows HTTP and sends no credentials', async () => {
  let requests = 0;
  const api = load(async () => {
    requests++;
    return response(200, {});
  }, 'http://api.example.test');
  await assert.rejects(api.apiRequest('/finance/wallet'));
  assert.equal(requests, 0);
});
test('refresh requests share one flight and transport the HttpOnly cookie', async () => {
  const requests = [];
  const api = load(async (url, options) => {
    requests.push({ url, options });
    return response(200, auth('a'));
  });
  await Promise.all([api.restoreApiSession('a'), api.restoreApiSession('a')]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.credentials, 'include');
  assert.equal(requests[0].options.headers.Origin, 'https://app.example.test');
  assert.equal(api.apiUser().id, 'a');
  assert.equal(api.apiUser().password, undefined);
});
test('an old financial request is not retried under a newly signed-in account', async () => {
  const requests = [];
  let resolveOld;
  const api = load(async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/finance/withdrawals'))
      return new Promise((resolve) => {
        resolveOld = resolve;
      });
    if (url.endsWith('/auth/login')) return response(200, auth(JSON.parse(options.body).email));
    return response(200, true);
  });
  await api.apiLogin('a', 'password-a');
  const original = api.apiRequest('/finance/withdrawals', 'POST', { amount: 50000 });
  await api.apiLogout();
  await api.apiLogin('b', 'password-b');
  resolveOld(response(401, null, 1004));
  await assert.rejects(original);
  assert.equal(api.apiUser().id, 'b');
  assert.equal(requests.filter((r) => r.url.endsWith('/finance/withdrawals')).length, 1);
  assert.equal(requests.filter((r) => r.url.endsWith('/auth/refresh')).length, 0);
});
test('refresh cannot switch identity and replay a financial operation', async () => {
  const requests = [];
  let expired = 0;
  const api = load(async (url, options) => {
    requests.push({ url, options });
    if (url.endsWith('/auth/login')) return response(200, auth('a'));
    if (url.endsWith('/auth/refresh')) return response(200, auth('b'));
    return response(401, null, 1004);
  });
  await api.apiLogin('a', 'password');
  api.onApiSessionExpired(() => expired++);
  await assert.rejects(api.apiRequest('/finance/withdrawals', 'POST', { amount: 50000 }));
  assert.equal(api.apiUser(), null);
  assert.equal(expired, 1);
  assert.equal(requests.filter((r) => r.url.endsWith('/finance/withdrawals')).length, 1);
});
test('valid refresh rotation retries once with the same identity and new token', async () => {
  let tries = 0;
  const sent = [];
  const api = load(async (url, options) => {
    if (url.endsWith('/auth/login')) return response(200, auth('a'));
    if (url.endsWith('/auth/refresh')) return response(200, auth('a', 'rotated-a'));
    sent.push(options.headers.Authorization);
    return ++tries === 1 ? response(401, null, 1004) : response(200, { availableBalance: 0 });
  });
  await api.apiLogin('a', 'password');
  const wallet = await api.apiRequest('/finance/wallet');
  assert.equal(wallet.availableBalance, 0);
  assert.deepEqual(sent, ['Bearer access-a', 'Bearer rotated-a']);
});

test('checkout retries preserve the same key through refresh and repeated taps', async () => {
  const keys = [];
  let count = 0;
  let issued = 0;
  const api = load(async (url, options) => {
    if (url.endsWith('/auth/login')) return response(200, auth('a'));
    if (url.endsWith('/auth/refresh')) return response(200, auth('a', 'rotated'));
    if (url.endsWith('/finance/request-key')) {
      issued++;
      return response(200, '01234567-89ab-cdef-0123-456789abcdef');
    }
    keys.push(options.headers['Idempotency-Key']);
    return ++count === 1
      ? response(401, null, 1004)
      : response(200, { orderId: 'order-a', paymentStatus: 'CREATING' });
  });
  await api.apiLogin('a', 'password');
  await api.apiRequest('/payments/fund', 'POST', { contractId: 'contract-a' });
  await api.apiRequest('/payments/fund', 'POST', {
    contractId: 'contract-a',
    returnUrl: 'https://another-safe-return.example',
  });
  assert.equal(issued, 1);
  assert.equal(keys.length, 3);
  assert.ok(keys.every((k) => k === keys[0]));
});
