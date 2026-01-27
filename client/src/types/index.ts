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
  parent?: string | null;
  isSubCategory?: boolean;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  _id?: string;
  attributes: Record<string, string>; // e.g., { "Color": "Red", "Size": "M" }
  image?: string;
  price: number;
  promoPrice?: number | null;
  stock: number;
  sku?: string;
}

export interface VariantAttribute {
  name: string; // e.g., "Color", "Size"
  values: string[]; // e.g., ["Red", "Blue", "Green"]
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  promoPrice?: number | null;
  category: Category;
  images: string[];
  stock: number;
  sku?: string;
  rating: number;
  numReviews: number;
  tags: string[];
  featured: boolean;
  hasVariants?: boolean;
  variantAttributes?: VariantAttribute[];
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product?: Product;
  selectedVariant?: ProductVariant; // Selected variant if product has variants
  pack?: {
    _id: string;
    name: string;
    description: string;
    image?: string;
    discountPrice: number;
    originalPrice: number;
    discountPercentage: number;
    products: Array<{
      product: Product;
      quantity: number;
    }>;
  };
  quantity: number;
  type: 'product' | 'pack';
}

export interface WishlistItem {
  product: Product;
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
