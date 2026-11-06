const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load() {
  const exports = {};
  const writes = [];
  const opened = [];
  const pushed = [];
  let owner = 'payer';
  vm.runInNewContext(
    ts.transpileModule(fs.readFileSync('src/services/payments.ts', 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: false,
      },
    }).outputText,
    {
      exports,
      module: { exports },
      URL,
      require(name) {
        if (name === '@react-native-async-storage/async-storage')
          return { default: { setItem: async (k, v) => writes.push([k, v]) } };
        if (name === 'expo-linking') return { openURL: async (url) => opened.push(url) };
        if (name === 'expo-router') return { router: { push: (route) => pushed.push(route) } };
        if (name === './api/client')
          return { apiUser: () => (owner ? { id: owner } : null), apiRequest: async () => null };
        throw Error(name);
      },
    },
  );
  return {
    ...exports,
    writes,
    opened,
    pushed,
    setOwner: (value) => {
      owner = value;
    },
  };
}
const id = '01234567-89ab-cdef-0123-456789abcdef';
test('native checkout opens Pay2S with only account-scoped order metadata persisted', async () => {
  const h = load();
  await h.openPayment({ orderId: id, checkoutUrl: 'https://sandbox-payment.pay2s.vn/pay/test' });
  assert.equal(h.writes[0][0], 'sam:checkout:payer');
  assert.equal(h.writes[0][1], id);
  assert.equal(h.pushed[0].pathname, '/payment-return');
  assert.equal(h.opened.length, 1);
});
test('native checkout refuses untrusted destinations and cannot be opened while logged out', async () => {
  for (const url of [
    'http://payment.pay2s.vn/pay',
    'https://evil.example/pay',
    'https://private@payment.pay2s.vn/pay',
  ]) {
    const h = load();
    await assert.rejects(h.openPayment({ orderId: id, checkoutUrl: url }));
    assert.equal(h.opened.length, 0);
    assert.equal(h.writes.length, 0);
  }
  const h = load();
  h.setOwner(null);
  await assert.rejects(h.openPayment({ orderId: id }));
});
test('native activation is reported only after backend fulfillment', () => {
  const h = load();
  assert.match(
    h.paymentLabel({ paymentStatus: 'PAID', fulfillmentStatus: 'PENDING' }),
    /đang kích hoạt/,
  );
  assert.match(
    h.paymentLabel({ paymentStatus: 'PAID', fulfillmentStatus: 'APPLIED' }),
    /và kích hoạt/,
  );
  assert.equal(h.normalizeCheckoutId('not-an-order'), null);
});
