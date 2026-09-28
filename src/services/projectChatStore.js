import { localizeProject, localizeApplication } from '../utils/projectVietnamese';

const STORAGE_KEY = 'sam_project_chats_v1';
const clone = (value) => JSON.parse(JSON.stringify(value));

export function makeProjectConversation(application, project) {
  if (application.status !== 'accepted' || project.status !== 'in_progress') throw new Error('Chat chỉ mở khi dự án đã bắt đầu.');
  if (application.jobId !== project.id || application.customerId !== project.customerId) throw new Error('Thông tin dự án không khớp.');
  return {
    id: `project:${project.id}:${application.freelancerId}`,
    application: clone(application), project: clone(project),
    participants: [application.customerId, application.freelancerId],
    startedAt: new Date().toISOString(), messages: [], readCounts: {},
  };
}

export function createProjectChatStore(seed = [], storage = null) {
  let rooms = clone(seed);
  let loaded = false;
  let queue = Promise.resolve();
  const run = (operation) => {
    const result = queue.then(async () => {
      if (!loaded) {
        const raw = storage ? await storage.getItem(STORAGE_KEY) : null;
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved.version !== 1 || !Array.isArray(saved.rooms)) throw new Error('Không thể đọc lịch sử chat đã lưu.');
          rooms = [...seed.filter((room) => !saved.rooms.some((item) => item.id === room.id)), ...saved.rooms.map((room) => ({ ...room, project: localizeProject(room.project), application: localizeApplication(room.application) }))];
        }
        loaded = true;
      }
      return operation();
    });
    queue = result.catch(() => {});
    return result;
  };
  const commit = async (next) => {
    if (storage) await storage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, rooms: next }));
    rooms = next;
  };
  const requireRoom = (id, userId) => {
    const room = rooms.find((item) => item.id === id);
    if (!userId || !room?.participants.includes(userId)) throw new Error('Bạn không có quyền truy cập hội thoại này.');
    return room;
  };
  return {
    snapshot: () => run(() => clone(rooms)),
    list: (userId) => run(() => clone(rooms.filter((room) => userId && room.participants.includes(userId))).sort((a, b) => (b.messages.at(-1)?.createdAt || b.startedAt).localeCompare(a.messages.at(-1)?.createdAt || a.startedAt))),
    start: (application, project, actorId) => run(async () => {
      if (!actorId || actorId !== application.customerId) throw new Error('Chỉ chủ dự án được bắt đầu dự án.');
      const room = makeProjectConversation(application, project);
      const existing = rooms.find((item) => item.id === room.id);
      if (existing) return clone(existing);
      await commit([...rooms, room]);
      return clone(room);
    }),
    send: (id, userId, text, clientId) => run(async () => {
      const room = requireRoom(id, userId);
      if (room.project.status !== 'in_progress') throw new Error('Dự án hiện không cho phép gửi tin nhắn.');
      const body = String(text || '').trim();
      if (!body || body.length > 2000) throw new Error('Tin nhắn cần từ 1 đến 2.000 ký tự.');
      if (!clientId) throw new Error('Thiếu mã tin nhắn.');
      const existing = room.messages.find((message) => message.id === clientId && message.senderId === userId);
      if (existing) return clone(existing);
      const message = { id: clientId, senderId: userId, text: body, createdAt: new Date().toISOString() };
      const updated = { ...room, messages: [...room.messages, message], readCounts: { ...room.readCounts, [userId]: room.messages.length + 1 } };
      await commit(rooms.map((item) => item.id === id ? updated : item));
      return clone(message);
    }),
    markRead: (id, userId) => run(async () => {
      const room = requireRoom(id, userId);
      if (room.readCounts[userId] === room.messages.length) return;
      await commit(rooms.map((item) => item.id === id ? { ...item, readCounts: { ...item.readCounts, [userId]: item.messages.length } } : item));
    }),
  };
}

export const conversationUnread = (room, userId) => room.messages.slice(room.readCounts[userId] || 0).filter((message) => message.senderId !== userId).length;
export const conversationPeer = (room, userId) => userId === room.application.customerId
  ? { name: room.application.freelancerName, avatar: room.application.freelancerAvatar, role: 'Freelancer' }
  : { name: room.application.customerName, avatar: room.application.customerAvatar, role: 'Khách hàng' };
