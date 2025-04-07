export interface Product {
  id: string
  name: string
  description: string
  fullDescription?: string
  price: number
  originalPrice?: number
  discount: number
  rating: number
  stock: number
  sold: number
  category: string
  brand: string
  sku: string
  images: string[]
  features: string[]
  specifications?: Record<string, string>
  reviews: Review[]
  isNew: boolean
  featured: boolean
  trending: boolean
  createdAt: string
}

export interface Review {
  id: string
  name: string
  rating: number
  comment: string
  date: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface PhilippineLocation {
  islandGroup: string
  name: string
  provinces: Province[]
}

export interface Province {
  name: string
  municipalities: Municipality[]
}

export interface Municipality {
  name: string
  barangays: string[]
}

export interface Order {
  id: string
  date: string
  status: string
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  paymentMethod: string
  address: OrderAddress
}

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface OrderAddress {
  fullName: string
  phone: string
  email: string
  street: string
  barangay: string
  municipality: string
  province: string
  region: string
  postalCode: string
}

