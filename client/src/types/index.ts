// Product types
export interface Product {
  id: string
  slug: string
  name: string
  description?: string
  price: number
  oldPrice?: number
  image: string | null
  images?: string[]
  category?: string
  categorySlug?: string
  rating?: number
  reviewsCount?: number
  inStock?: boolean
  isNew?: boolean
  isHit?: boolean
  sku?: string
  material?: string
  color?: string
  size?: string
  width?: number
  height?: number
  weight?: number
  attributes?: ProductAttribute[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductAttribute {
  name: string
  value: string
}

export interface Category {
  id: string
  slug: string
  name: string
  description?: string
  image?: string
  parentId?: string
  productsCount?: number
}

// Cart types
export interface CartItem {
  id: string
  name: string
  price: number
  image: string | null
  quantity: number
  size?: string
  color?: string
}

export interface Cart {
  items: CartItem[]
  total: number
  itemsCount: number
}

// Order types
export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  customer: Customer
  shippingAddress: ShippingAddress
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type PaymentMethod = 'card' | 'liqpay' | 'cash_on_delivery'

// Customer types
export interface Customer {
  id?: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface ShippingAddress {
  city: string
  cityRef?: string
  warehouse: string
  warehouseRef?: string
  street?: string
  building?: string
  apartment?: string
  postalCode?: string
}

// Nova Poshta types
export interface NovaPoshtaCity {
  Ref: string
  Description: string
  DescriptionRu: string
  Area: string
  AreaDescription: string
}

export interface NovaPoshtaWarehouse {
  Ref: string
  Description: string
  DescriptionRu: string
  Number: string
  CityRef: string
  TypeOfWarehouse: string
}

// Review types
export interface Review {
  id: string
  productId: string
  author: string
  rating: number
  text: string
  createdAt: string
  isVerified: boolean
}

// API Response types
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
}

export interface ApiError {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

// Filter types
export interface ProductFilter {
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isNew?: boolean
  isHit?: boolean
  colors?: string[]
  materials?: string[]
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'rating'
  page?: number
  limit?: number
  search?: string
}
