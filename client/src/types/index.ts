export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: Address;
}

export interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  stock: number;
  sku?: string;
  rating: number;
  numReviews: number;
  tags: string[];
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  _id: string;
  user?: User;
  guestInfo?: {
    name: string;
    email: string;
    phone: string;
    address: Address;
  };
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: PaginationInfo;
}

export interface CategoriesResponse {
  success: boolean;
  count: number;
  categories: Category[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  orders: Order[];
}

export interface OrderStatsResponse {
  success: boolean;
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    ordersByStatus: { _id: string; count: number }[];
  };
}
