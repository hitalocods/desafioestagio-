export type ProductType = 'PHYSICAL' | 'BOOKING';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  type: ProductType;
  stock: number;
  availableSlots: string[] | null;
  locationOrDuration: string | null;
  rating: number;
}

export interface BookingMetadata {
  checkInDate: string;
  checkInTime: string;
  guests: number;
  notes?: string;
}

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  type: ProductType;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  booking?: BookingMetadata;
}

export interface CartState {
  sessionId: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: string;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productName: string;
  productType: ProductType;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  bookingDetails: BookingMetadata | null;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  paymentMethod: string;
  totalAmount: number;
  status: string;
  emailPreviewUrl?: string | null;
  createdAt: string;
  items: OrderItemResponse[];
}

export interface OrderResponse {
  message: string;
  order: OrderSummary;
  email: {
    sent: boolean;
    recipient: string;
    previewUrl: string | null;
  };
}

