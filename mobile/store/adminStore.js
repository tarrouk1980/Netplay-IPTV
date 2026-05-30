import { create } from 'zustand';
import api from '../services/api';

const useAdminStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────────
  stats: {},
  users: [],
  usersTotal: 0,
  usersTotalPages: 1,
  usersPage: 1,

  orders: [],
  ordersTotal: 0,
  ordersTotalPages: 1,
  ordersPage: 1,

  pendingKYC: [],
  pendingKYCCount: 0,

  disputes: [],
  disputesTotal: 0,

  merchants: [],
  merchantsTotal: 0,

  reports: {
    subscriptions: null,
    topProviders: null,
    topMerchants: null,
  },

  ordersChart: null,

  isLoading: false,
  error: null,

  // ── Stats ──────────────────────────────────────────────────────────────────
  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/stats');
      set({ stats: res.data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement stats', isLoading: false });
    }
  },

  fetchOrdersChart: async (type) => {
    try {
      const params = type ? { type } : {};
      const res = await api.get('/api/admin/stats/orders-chart', { params });
      set({ ordersChart: res.data });
    } catch (err) {
      console.error('[adminStore] ordersChart', err);
    }
  },

  // ── Users ──────────────────────────────────────────────────────────────────
  fetchUsers: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/users', { params: filters });
      set({
        users: res.data.users,
        usersTotal: res.data.total,
        usersTotalPages: res.data.totalPages,
        usersPage: res.data.page,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement utilisateurs', isLoading: false });
    }
  },

  fetchUserDetail: async (id) => {
    try {
      const res = await api.get(`/api/admin/users/${id}`);
      return res.data.user;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur chargement utilisateur');
    }
  },

  suspendUser: async (id) => {
    try {
      const res = await api.patch(`/api/admin/users/${id}/suspend`);
      // Update user in local list
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, kycStatus: 'REJECTED' } : u)),
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur suspension');
    }
  },

  reactivateUser: async (id) => {
    try {
      const res = await api.patch(`/api/admin/users/${id}/reactivate`);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? { ...u, kycStatus: 'APPROVED' } : u)),
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur réactivation');
    }
  },

  deleteUser: async (id) => {
    try {
      const res = await api.delete(`/api/admin/users/${id}`);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur suppression');
    }
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  fetchOrders: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/orders', { params: filters });
      set({
        orders: res.data.orders,
        ordersTotal: res.data.total,
        ordersTotalPages: res.data.totalPages,
        ordersPage: res.data.page,
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement commandes', isLoading: false });
    }
  },

  fetchOrderDetail: async (id) => {
    try {
      const res = await api.get(`/api/admin/orders/${id}`);
      return res.data.order;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur chargement commande');
    }
  },

  forceCancelOrder: async (id, reason) => {
    try {
      const res = await api.post(`/api/admin/orders/${id}/force-cancel`, { reason });
      set((state) => ({
        orders: state.orders.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' } : o)),
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur annulation');
    }
  },

  // ── KYC ────────────────────────────────────────────────────────────────────
  fetchPendingKYC: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/kyc/pending');
      set({ pendingKYC: res.data.users, pendingKYCCount: res.data.count, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement KYC', isLoading: false });
    }
  },

  approveKYC: async (id) => {
    try {
      const res = await api.post(`/api/admin/kyc/${id}/approve`);
      set((state) => ({ pendingKYC: state.pendingKYC.filter((u) => u.id !== id) }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur approbation KYC');
    }
  },

  rejectKYC: async (id, reason) => {
    try {
      const res = await api.post(`/api/admin/kyc/${id}/reject`, { reason });
      set((state) => ({ pendingKYC: state.pendingKYC.filter((u) => u.id !== id) }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur rejet KYC');
    }
  },

  // ── Disputes ───────────────────────────────────────────────────────────────
  fetchDisputes: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/disputes', { params: filters });
      set({ disputes: res.data.disputes, disputesTotal: res.data.total, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement disputes', isLoading: false });
    }
  },

  resolveDispute: async (orderId, body) => {
    try {
      const res = await api.post(`/api/admin/disputes/${orderId}/resolve`, body);
      set((state) => ({
        disputes: state.disputes.filter((d) => d.order?.id !== orderId),
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur résolution dispute');
    }
  },

  // ── Merchants ──────────────────────────────────────────────────────────────
  fetchMerchants: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get('/api/admin/merchants', { params: filters });
      set({ merchants: res.data.merchants, merchantsTotal: res.data.total, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement marchands', isLoading: false });
    }
  },

  suspendMerchant: async (id) => {
    try {
      const res = await api.patch(`/api/admin/merchants/${id}/suspend`);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur suspension marchand');
    }
  },

  boostMerchant: async (id, days) => {
    try {
      const res = await api.patch(`/api/admin/merchants/${id}/boost`, { days });
      set((state) => ({
        merchants: state.merchants.map((m) =>
          m.id === id ? { ...m, isBoosted: true, boostedUntil: res.data.boostedUntil } : m
        ),
      }));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Erreur boost marchand');
    }
  },

  // ── Reports ────────────────────────────────────────────────────────────────
  fetchReports: async () => {
    set({ isLoading: true, error: null });
    try {
      const [subRes, provRes, merRes] = await Promise.all([
        api.get('/api/admin/reports/subscriptions'),
        api.get('/api/admin/reports/top-providers'),
        api.get('/api/admin/reports/top-merchants'),
      ]);
      set({
        reports: {
          subscriptions: subRes.data,
          topProviders: provRes.data,
          topMerchants: merRes.data,
        },
        isLoading: false,
      });
    } catch (err) {
      set({ error: err.response?.data?.error || 'Erreur chargement rapports', isLoading: false });
    }
  },
}));

export default useAdminStore;
