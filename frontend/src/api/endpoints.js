import { api } from './client'

// ===================== AUTH =====================
export const authApi = {
  register: (data) => api.post('/auth/register', data, { auth: false }),
  login: (data) => api.post('/auth/login', data, { auth: false }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ===================== CLIENTS =====================
export const clientsApi = {
  getMe: () => api.get('/customers/me'),
  updateMe: (data) => api.put('/customers/me', data),
  deleteMe: () => api.delete('/customers/me'),
}

// ===================== PRODUCTS =====================
export const productsApi = {
  list: (params) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get(`/products${qs ? `?${qs}` : ''}`, { auth: false })
  },
  getById: (id) => api.get(`/products/${id}`, { auth: false }),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
}

// ===================== CART =====================
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (itemId, quantity) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  deleteItem: (itemId) => api.delete(`/cart/items/${itemId}`),
}

// ===================== ORDERS =====================
export const ordersApi = {
  create: (data) => api.post('/orders', data),
  list: (params) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status_filter', params.status)
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    const qs = query.toString()
    return api.get(`/orders${qs ? `?${qs}` : ''}`)
  },
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
}

// ===================== REVIEWS =====================
export const reviewsApi = {
  listByProduct: (productId) =>
    api.get(`/reviews/product/${productId}`, { auth: false }),
  create: (productId, data) =>
    api.post(`/reviews/product/${productId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
}

// ===================== STATISTICS =====================
export const statsApi = {
  get: () => api.get('/admin/statistics'),
}