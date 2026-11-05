import {
  BookingMetadata,
  CartState,
  OrderResponse,
  OrderSummary,
  Product,
  ProductType,
} from '@/types/ecommerce';
import { CheckoutFormValues } from './schemas';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMessage = 'Ocorreu um erro ao comunicar com o servidor.';
    try {
      const errorData = await res.json();
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map((e: any) => e.message).join(' • ');
      } else if (errorData.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message;
      }
    } catch {
      // ignora erro de parse
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export const api = {
  async getProducts(params?: {
    type?: ProductType | 'ALL';
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'ALL') {
      query.set('type', params.type);
    }
    if (params?.category && params.category !== 'ALL') {
      query.set('category', params.category);
    }
    if (params?.search && params.search.trim() !== '') {
      query.set('search', params.search.trim());
    }

    const qs = query.toString();
    const res = await fetch(`${API_BASE_URL}/produtos${qs ? `?${qs}` : ''}`, {
      cache: 'no-store',
    });
    return handleResponse<Product[]>(res);
  },

  async getCart(sessionId: string): Promise<CartState> {
    const res = await fetch(`${API_BASE_URL}/carrinho`, {
      headers: {
        'x-session-id': sessionId,
      },
      credentials: 'include',
      cache: 'no-store',
    });
    return handleResponse<CartState>(res);
  },

  async addToCart(
    sessionId: string,
    payload: {
      productId: string;
      quantity: number;
      booking?: BookingMetadata;
    },
  ): Promise<CartState> {
    const res = await fetch(`${API_BASE_URL}/carrinho`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<CartState>(res);
  },

  async updateCartItem(
    sessionId: string,
    payload: {
      itemId: string;
      quantity: number;
    },
  ): Promise<CartState> {
    const res = await fetch(`${API_BASE_URL}/carrinho`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<CartState>(res);
  },

  async clearCart(sessionId: string): Promise<CartState> {
    const res = await fetch(`${API_BASE_URL}/carrinho`, {
      method: 'DELETE',
      headers: {
        'x-session-id': sessionId,
      },
      credentials: 'include',
    });
    return handleResponse<CartState>(res);
  },

  async checkout(
    sessionId: string,
    payload: CheckoutFormValues,
  ): Promise<OrderResponse> {
    const res = await fetch(`${API_BASE_URL}/finalizar-compra`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    return handleResponse<OrderResponse>(res);
  },

  async getOrders(): Promise<OrderSummary[]> {
    const res = await fetch(`${API_BASE_URL}/pedidos`, {
      cache: 'no-store',
    });
    return handleResponse<OrderSummary[]>(res);
  },
};
