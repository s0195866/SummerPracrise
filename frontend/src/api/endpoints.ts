import { api } from './client'
import type {
  RegisterRequest,
  LoginRequest,
  TokenResponse,
  ClientOut,
  ClientUpdate,
  ProductOut,
  ProductCreate,
  CartItemAdd,
  CartOut,
  OrderCreate,
  OrderOut,
  ReviewCreate,
  ReviewOut,
  StatisticsOut,
} from './types'

// ===================== AUTH =====================
export const authApi = {
  register: (data: RegisterRequest) => api.post<TokenResponse>('/auth/register', data, { auth: false }),
  login: (data: LoginRequest) => api.post<TokenResponse>('/auth/login', data, { auth: false }),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<ClientOut>('/auth/me'),
}

// ===================== CLIENTS =====================
export const clientsApi = {
  getMe: () => api.get<ClientOut>('/customers/me'),
  updateMe: (data: ClientUpdate) => api.put<ClientOut>('/customers/me', data),
  deleteMe: () => api.delete<void>('/customers/me'),
}

// ===================== PRODUCTS =====================
export const productsApi = {
  list: (params?: { limit?: number; offset?: number; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return api.get<ProductOut[]>(`/products${qs ? `?${qs}` : ''}`, { auth: false })
  },
  getById: (id: number) => api.get<ProductOut>(`/products/${id}`, { auth: false }),
  create: (data: ProductCreate) => api.post<ProductOut>('/products', data),
  update: (id: number, data: Partial<ProductCreate>) => api.put<ProductOut>(`/products/${id}`, data),
  delete: (id: number) => api.delete<void>(`/products/${id}`),
}

// ===================== CART =====================
export const cartApi = {
  get: () => api.get<CartOut>('/cart'),
  addItem: (data: CartItemAdd) => api.post<CartOut>('/cart/items', data),
  updateItem: (itemId: number, quantity: number) =>
    api.put<CartOut>(`/cart/items/${itemId}`, { quantity }),
  deleteItem: (itemId: number) => api.delete<CartOut>(`/cart/items/${itemId}`),
}

// ===================== ORDERS =====================
export const ordersApi = {
  create: (data: OrderCreate) => api.post<OrderOut>('/orders', data),
  list: (params?: { status?: string; limit?: number; offset?: number }) => {
    const query = new URLSearchParams()
    if (params?.status) query.set('status_filter', params.status)
    if (params?.limit) query.set('limit', String(params.limit))
    if (params?.offset) query.set('offset', String(params.offset))
    const qs = query.toString()
    return api.get<OrderOut[]>(`/orders${qs ? `?${qs}` : ''}`)
  },
  getById: (id: number) => api.get<OrderOut>(`/orders/${id}`),
  cancel: (id: number) => api.put<OrderOut>(`/orders/${id}/cancel`),
}

// ===================== REVIEWS =====================
export const reviewsApi = {
  listByProduct: (productId: number) =>
    api.get<ReviewOut[]>(`/reviews/product/${productId}`, { auth: false }),
  create: (productId: number, data: ReviewCreate) =>
    api.post<ReviewOut>(`/reviews/product/${productId}`, data),
  delete: (reviewId: number) => api.delete<void>(`/reviews/${reviewId}`),
}

// ===================== STATISTICS =====================
export const statsApi = {
  get: () => api.get<StatisticsOut>('/admin/statistics'),
}