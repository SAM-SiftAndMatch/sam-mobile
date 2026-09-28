/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { Buffer } = require('node:buffer');
const fs = require('node:fs');
const path = require('node:path');
function moduleUrl(file) {
  const source = fs.readFileSync(file, 'utf8').replace(/from '([^']+)'/g, (_, specifier) => `from '${moduleUrl(path.resolve(path.dirname(file), `${specifier}.js`))}'`);
  return `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
}
const chatModule = import(moduleUrl(path.resolve(__dirname, '../src/services/projectChatStore.js')));
const serviceModule = import(moduleUrl(path.resolve(__dirname, '../src/services/mockService.js')));
const application = { id: 'proposal-test', jobId: 'project-test', customerId: 'customer', freelancerId: 'freelancer', customerName: 'Khách hàng', freelancerName: 'Freelancer', status: 'accepted' };
const project = { id: 'project-test', customerId: 'customer', title: 'Dự án chat', status: 'in_progress' };
const memoryStorage = () => {
  const values = new Map();
  return { getItem: async (key) => values.get(key) || null, setItem: async (key, value) => { values.set(key, value); } };
};

test('chat requires accepted proposal, active project and customer authorization', async () => {
  const { createProjectChatStore } = await chatModule;
  const store = createProjectChatStore();
  await assert.rejects(store.start({ ...application, status: 'pending' }, project, 'customer'), /đã bắt đầu/);
  await assert.rejects(store.start(application, { ...project, status: 'open' }, 'customer'), /đã bắt đầu/);
  await assert.rejects(store.start(application, project, 'freelancer'), /Chỉ chủ dự án/);
  assert.deepEqual(await store.list('customer'), []);
});

test('both participants share one room; outsiders cannot list, read or send', async () => {
  const { createProjectChatStore } = await chatModule;
  const store = createProjectChatStore();
  const [room, duplicate] = await Promise.all([store.start(application, project, 'customer'), store.start(application, project, 'customer')]);
  assert.equal(room.id, duplicate.id);
  assert.equal((await store.list('customer')).length, 1);
  assert.equal((await store.list('freelancer'))[0].id, room.id);
  assert.deepEqual(await store.list('outsider'), []);
  await assert.rejects(store.markRead(room.id, 'outsider'), /không có quyền/);
  await assert.rejects(store.send(room.id, 'outsider', 'Không hợp lệ', 'msg-x'), /không có quyền/);
});

test('messages, unread counts and project start survive reopening the store', async () => {
  const { createProjectChatStore, conversationUnread, conversationPeer } = await chatModule;
  const storage = memoryStorage();
  const store = createProjectChatStore([], storage);
  const room = await store.start(application, project, 'customer');
  await store.send(room.id, 'customer', ' Xin chào ', 'message-1');
  await store.send(room.id, 'customer', ' Xin chào ', 'message-1');
  const restored = createProjectChatStore([], storage);
  const [saved] = await restored.list('freelancer');
  assert.equal(saved.messages.length, 1);
  assert.equal(saved.messages[0].text, 'Xin chào');
  assert.equal(saved.project.status, 'in_progress');
  assert.equal(conversationUnread(saved, 'freelancer'), 1);
  assert.equal(conversationUnread(saved, 'customer'), 0);
  assert.equal(conversationPeer(saved, 'freelancer').name, 'Khách hàng');
  await restored.markRead(room.id, 'freelancer');
  assert.equal(conversationUnread((await restored.list('freelancer'))[0], 'freelancer'), 0);
  await restored.send(room.id, 'freelancer', 'Tôi đã nhận yêu cầu', 'message-2');
  assert.equal(conversationUnread((await restored.list('customer'))[0], 'customer'), 1);
});

test('empty/oversized messages and failed writes do not appear as sent', async () => {
  const { createProjectChatStore } = await chatModule;
  const storage = memoryStorage();
  const store = createProjectChatStore([], storage);
  const room = await store.start(application, project, 'customer');
  await assert.rejects(store.send(room.id, 'customer', '  ', 'empty'), /2.000/);
  await assert.rejects(store.send(room.id, 'customer', 'a'.repeat(2001), 'long'), /2.000/);
  const originalWrite = storage.setItem;
  storage.setItem = async () => { throw new Error('disk full'); };
  await assert.rejects(store.send(room.id, 'customer', 'Thử lại', 'retry'), /disk full/);
  assert.equal((await store.list('customer'))[0].messages.length, 0);
  storage.setItem = originalWrite;
  await store.send(room.id, 'customer', 'Thử lại', 'retry');
  assert.equal((await store.list('customer'))[0].messages.length, 1);
});

test('legacy project translations preserve chat history and custom content', async () => {
  const { createProjectChatStore } = await chatModule;
  const storage = memoryStorage();
  const store = createProjectChatStore([], storage);
  const legacyTitle = 'Node.js REST API & Authentication Microservice';
  const room = await store.start({ ...application, jobTitle: legacyTitle }, { ...project, title: legacyTitle, description: 'Custom customer requirements', category: 'Web Development', location: 'Remote' }, 'customer');
  await store.send(room.id, 'customer', 'Please keep this original message', 'original-message');
  const [restored] = await createProjectChatStore([], storage).list('customer');
  assert.equal(restored.project.title, 'Xây dựng REST API và dịch vụ xác thực bằng Node.js');
  assert.equal(restored.application.jobTitle, restored.project.title);
  assert.equal(restored.project.category, 'Lập trình web');
  assert.equal(restored.project.description, 'Custom customer requirements');
  assert.equal(restored.messages[0].text, 'Please keep this original message');
});

test('approval starts project and opens the same chat for customer and freelancer', async () => {
  const service = await serviceModule;
  const storage = memoryStorage();
  service.configureChatStorage(storage);
  await assert.rejects(service.updateApplicationStatus('app001', 'accepted', 'user001'), /Chỉ chủ dự án/);
  assert.equal((await service.getApplications({ jobId: 'job001' }))[0].status, 'pending');
  await Promise.all([service.updateApplicationStatus('app001', 'accepted', 'user002'), service.updateApplicationStatus('app001', 'accepted', 'user002')]);
  assert.equal((await service.getJobById('job001')).status, 'in_progress');
  const room = (await service.getConversations('user001')).find((item) => item.application.id === 'app001');
  assert.ok(room);
  assert.equal((await service.getConversations('user002')).filter((item) => item.id === room.id).length, 1);
  await service.sendProjectMessage(room.id, 'user001', 'Bắt đầu nhé!', 'integration-1');
  service.configureChatStorage(storage);
  assert.equal((await service.getConversations('user002')).find((item) => item.id === room.id).messages[0].text, 'Bắt đầu nhé!');
  await assert.rejects(service.updateApplicationStatus('app001', 'rejected', 'user002'), /đã được xử lý/);
});
