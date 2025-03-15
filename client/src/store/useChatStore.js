import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../utils/axios';
import { useAuthStore } from './useAuthStore';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const response = await axiosInstance.get('/message/users');
      set({ users: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      set({ isUsersLoading: false });
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/message/delete-message/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
      toast.success('Message deleted successfully');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete message';
      toast.error(errorMsg);
      if (error.response?.status === 403) {
        console.warn('Unauthorized deletion attempt');
      }
      throw error; // Re-throw for UI feedback
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/chat-message/${userId}`);
      set({ messages: response.data });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch messages');
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) {
      toast.error('Please select a user to chat');
      return;
    }
    try {
      const res = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on('newMessage', (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set((state) => ({
        messages: Array.isArray(state.messages) ? [...state.messages, newMessage] : [newMessage],
      }));
    });

    socket.on('messageDeleted', ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== messageId),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off('newMessage');
    socket.off('messageDeleted');
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));