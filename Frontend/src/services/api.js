import axios from 'axios';

// Automatically use localhost during development, and the Render URL in production.
// You don't need to manually change this before deploying anymore!
const API_URL = import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000/api' : 'https://collexa-backend-c7cu.onrender.com/api');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Attach JWT to every outgoing request (if one exists in localStorage)
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    /**
     * Sends the raw Google ID token (credential) returned by the Google popup
     * to the backend for verification and upsert.
     * Returns the same {token, user} shape as login/register.
     */
    googleAuth: (credential) => api.post('/auth/google', { credential }),
    getMe: () => api.get('/auth/me')
};

// ─── Profile APIs ─────────────────────────────────────────────────────────────
export const profileAPI = {
    // Feature 2: Edit Profile
    getProfile: () => api.get('/profile'),
    updateProfile: (data) => api.put('/profile', data),
    // Feature 1: Profile Completion (onboarding)
    completeProfile: (data) => api.put('/profile/complete', data)
};

// ─── Product APIs ─────────────────────────────────────────────────────────────
export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    createWithImages: (formData) => api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => api.put(`/products/${id}`, data),
    updateWithImages: (id, formData) => api.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => api.delete(`/products/${id}`),
    getMyProducts: () => api.get('/products/user/my-products')
};

// ─── Admin APIs ───────────────────────────────────────────────────────────────
export const adminAPI = {
    // Dashboard
    getStats: () => api.get('/admin/stats'),

    // Users
    getAllUsers: (params) => api.get('/admin/users', { params }),
    getUser: (id) => api.get(`/admin/users/${id}`),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),

    // Listings
    getAllListings: (params) => api.get('/admin/listings', { params }),
    getListing: (id) => api.get(`/admin/listings/${id}`),
    deleteListing: (id) => api.delete(`/admin/listings/${id}`)
};

export default api;
