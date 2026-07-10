// === Auth ===
export interface RegisterRequest {
  full_name: string
  phone: string
  email: string
  password: string
  address?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  role: string
  client_id: number
}

// === Client ===
export interface ClientOut {
  client_id: number
  full_name: string
  phone: string
  email: string
  address: string | null
  reg_date: string
  role: string
  total_purchases_amount: number
  is_regular: boolean
}

export interface ClientUpdate {
  full_name?: string
  phone?: string
  email?: string
  address?: string | null
}

// === Product ===
export interface ProductOut {
  product_id: number
  name: string
  price: number
  unit: string
  description: string | null
  stock_quantity: number
}

export interface ProductCreate {
  name: string
  price: number
  unit: string
  description?: string | null
  stock_quantity?: number
}

export interface ProductUpdate {
  name?: string
  price?: number
  unit?: string
  description?: string | null
  stock_quantity?: number
}

// === Cart ===
export interface CartItemAdd {
  product_id: number
  quantity: number
}

export interface CartItemUpdate {
  quantity: number
}

export interface CartItemOut {
  cart_item_id: number
  product_id: number
  product_name: string
  unit: string
  quantity: number
  price: number
}

export interface CartOut {
  cart_id: number
  items: CartItemOut[]
  total: number
}

// === Order ===
export interface OrderCreate {
  delivery_address: string
  delivery_method: string
  payment_method: string
}

export interface OrderItemOut {
  order_item_id: number
  product_id: number
  product_name: string
  quantity: number
  price_at_sale: number
  line_total: number
}

export interface OrderOut {
  order_id: number
  client_id: number
  sale_date: string
  delivery_date: string | null
  total_amount: number
  status: string
  delivery_address: string | null
  delivery_method: string | null
  payment_method: string | null
  discount_applied: number
  items: OrderItemOut[]
}

export interface OrderStatusUpdate {
  status: string
}

// === Review ===
export interface ReviewCreate {
  rating: number
  text?: string | null
}

export interface ReviewOut {
  review_id: number
  product_id: number
  client_id: number
  client_name: string
  rating: number
  review_text: string | null
  review_date: string
}

// === Statistics ===
export interface StatisticsOut {
  total_clients: number
  regular_clients: number
  total_products: number
  total_orders: number
  total_revenue: number
  average_order_value: number
  orders_by_status: Record<string, number>
}