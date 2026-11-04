export const conversationUnread = (room, userId) =>
  room.messages.slice(room.readCounts[userId] || 0).filter((message) => message.senderId !== userId)
    .length;
export const conversationPeer = (room, userId) =>
  userId === room.application.customerId
    ? {
        name: room.application.freelancerName,
        avatar: room.application.freelancerAvatar,
        role: 'Freelancer',
      }
    : {
        name: room.application.customerName,
        avatar: room.application.customerAvatar,
        role: 'Khách hàng',
      };
