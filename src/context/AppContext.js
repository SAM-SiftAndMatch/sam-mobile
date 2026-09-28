import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import {
  getJobs,
  getApplications,
  getNotifications,
  getCategories,
  createJob,
  createApplication,
  updateApplicationStatus,
  subscribePremium,
  markNotificationAsRead,
  getConversations,
  sendProjectMessage,
  markConversationRead,
} from '../services/mockService';
import { conversationUnread } from '../services/projectChatStore';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, role } = useAuth();
  const currentUserId = useRef(user?.id);

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatView, setChatView] = useState(null);

  // Filter & search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    currentUserId.current = user?.id;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setApplications([]);
      setNotifications([]);
      setConversations([]);
      setChatView(null);
      try {
        const filters = role === 'freelancer' ? { freelancerId: user?.id } : { customerId: user?.id };
        const [nextJobs, nextCategories, nextApps, nextNotifications, nextChats] = await Promise.all([
          getJobs(), getCategories(), user ? getApplications(filters) : [],
          user ? getNotifications(user.id) : [], user ? getConversations(user.id) : [],
        ]);
        if (cancelled) return;
        setJobs(nextJobs); setCategories(nextCategories); setApplications(nextApps);
        setNotifications(nextNotifications); setConversations(nextChats);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Không thể tải dữ liệu.');
      } finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [user, role]);

  const visibleConversations = conversations.filter((room) => room.participants.includes(user?.id));
  const chatUnreadCount = visibleConversations.reduce((sum, room) => sum + conversationUnread(room, user?.id), 0);
  const openMessages = (applicationId) => {
    const room = applicationId ? visibleConversations.find((item) => item.application.id === applicationId) : null;
    setChatView({ userId: user?.id, roomId: room?.id || null });
  };
  const closeMessages = () => setChatView(null);
  const selectConversation = (roomId) => {
    if (roomId && !visibleConversations.some((room) => room.id === roomId)) return;
    setChatView({ userId: user?.id, roomId });
  };
  const refreshConversations = async () => {
    if (!user) return;
    const rooms = await getConversations(user.id);
    if (currentUserId.current === user.id) setConversations(rooms);
  };
  const sendMessage = async (roomId, text, clientId) => {
    if (!user) throw new Error('Vui lòng đăng nhập.');
    await sendProjectMessage(roomId, user.id, text, clientId);
    await refreshConversations();
  };
  const readConversation = async (roomId) => {
    if (!user) return;
    await markConversationRead(roomId, user.id);
    await refreshConversations();
  };

  const fetchUserApplications = async () => {
    if (!user) return;
    try {
      const filters = role === 'freelancer' 
        ? { freelancerId: user.id } 
        : { customerId: user.id };
      const apps = await getApplications(filters);
      setApplications(apps);
    } catch (err) {
      console.log('Error loading applications:', err);
    }
  };

  const fetchUserNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await getNotifications(user.id);
      setNotifications(notifs);
    } catch (err) {
      console.log('Error loading notifications:', err);
    }
  };

  const refreshJobs = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getJobs(filters);
      setJobs(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to refresh jobs');
      setLoading(false);
    }
  };

  const postJob = async (jobData) => {
    setLoading(true);
    try {
      const newJob = await createJob({
        ...jobData,
        customerId: user?.id || 'user002',
        customerName: user?.name || 'Sarah Miller',
        customerAvatar: user?.avatar,
      });
      setJobs((prev) => [newJob, ...prev]);
      setLoading(false);
      return newJob;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const submitApplication = async (appData) => {
    setLoading(true);
    try {
      const newApp = await createApplication({
        ...appData,
        freelancerId: user?.id || 'user001',
        freelancerName: user?.name || 'Alex Johnson',
        freelancerAvatar: user?.avatar,
        freelancerRating: user?.rating || 4.9,
        freelancerSkills: user?.skills || ['React Native'],
      });

      setApplications((prev) => [newApp, ...prev]);
      
      // Refresh jobs list to reflect updated applications count
      const updatedJobs = await getJobs();
      setJobs(updatedJobs);

      setLoading(false);
      return newApp;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const changeAppStatus = async (id, status) => {
    setLoading(true);
    try {
      const updated = await updateApplicationStatus(id, status, user?.id);
      if (currentUserId.current !== user?.id) return updated;
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      const [nextJobs, rooms] = await Promise.all([getJobs(), getConversations(user.id)]);
      if (currentUserId.current !== user.id) return updated;
      setJobs(nextJobs);
      setConversations(rooms);
      if (status === 'accepted') {
        const room = rooms.find((item) => item.application.id === id);
        if (room) setChatView({ userId: user.id, roomId: room.id });
      }
      setLoading(false);
      return updated;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const subscribeToPlan = async (planId) => {
    setLoading(true);
    try {
      const result = await subscribePremium(user?.id || 'user001', planId);
      await fetchUserNotifications();
      setLoading(false);
      return result;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const markRead = async (notifId) => {
    try {
      await markNotificationAsRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.log('Error marking notification read:', err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppContext.Provider
      value={{
        jobs,
        applications,
        notifications,
        categories,
        loading,
        error,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        refreshJobs,
        fetchUserApplications,
        fetchUserNotifications,
        postJob,
        submitApplication,
        changeAppStatus,
        subscribeToPlan,
        markRead,
        unreadCount,
        conversations: visibleConversations,
        chatView: chatView?.userId === user?.id ? chatView : null,
        chatUnreadCount,
        openMessages, closeMessages, selectConversation, refreshConversations, sendMessage, readConversation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
