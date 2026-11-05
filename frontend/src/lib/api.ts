import {
  BookingMetadata,
  CartState,
  OrderResponse,
  OrderSummary,
  Product,
  ProductType,
} from '@/types/ecommerce';
import { CheckoutFormValues } from './schemas';
import { fallbackStore } from './fallback-store';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class BackendValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackendValidationError';
  }
}

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
    throw new BackendValidationError(errorMessage);
  }
  return res.json();
}

function shouldUseLocalFallback(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const isLocalHost = host === 'localhost' || host === '127.0.0.1';
  const pointsToLocalBackend =
    API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1');
  // Se estiver aberto pelo celular ou na Vercel (.vercel.app) e a API apontar para localhost, usa fallback direto!
  return !isLocalHost && pointsToLocalBackend;
}

export const api = {
  async getProducts(params?: {
    type?: ProductType | 'ALL';
    category?: string;
    search?: string;
  }): Promise<Product[]> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.getProducts(params);
    }
    try {
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
      return await handleResponse<Product[]>(res);
    } catch {
      return fallbackStore.getProducts(params);
    }
  },

  async getCart(sessionId: string): Promise<CartState> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.getCart(sessionId);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/carrinho`, {
        headers: {
          'x-session-id': sessionId,
        },
        credentials: 'include',
        cache: 'no-store',
      });
      return await handleResponse<CartState>(res);
    } catch {
      return fallbackStore.getCart(sessionId);
    }
  },

  async addToCart(
    sessionId: string,
    payload: {
      productId: string;
      quantity: number;
      booking?: BookingMetadata;
    },
  ): Promise<CartState> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.addToCart(sessionId, payload);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/carrinho`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      return await handleResponse<CartState>(res);
    } catch (err: any) {
      if (err instanceof BackendValidationError) {
        throw err;
      }
      return fallbackStore.addToCart(sessionId, payload);
    }
  },

  async updateCartItem(
    sessionId: string,
    payload: {
      itemId: string;
      quantity: number;
    },
  ): Promise<CartState> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.updateCartItem(sessionId, payload);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/carrinho`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      return await handleResponse<CartState>(res);
    } catch {
      return fallbackStore.updateCartItem(sessionId, payload);
    }
  },

  async clearCart(sessionId: string): Promise<CartState> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.clearCart(sessionId);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/carrinho`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId,
        },
        credentials: 'include',
      });
      return await handleResponse<CartState>(res);
    } catch {
      return fallbackStore.clearCart(sessionId);
    }
  },

  async checkout(
    sessionId: string,
    payload: CheckoutFormValues,
  ): Promise<OrderResponse> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.checkout(sessionId, payload);
    }
    try {
      const res = await fetch(`${API_BASE_URL}/finalizar-compra`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      return await handleResponse<OrderResponse>(res);
    } catch (err: any) {
      if (err instanceof BackendValidationError) {
        throw err;
      }
      return fallbackStore.checkout(sessionId, payload);
    }
  },

  async getOrders(): Promise<OrderSummary[]> {
    if (shouldUseLocalFallback()) {
      return fallbackStore.getOrders();
    }
    try {
      const res = await fetch(`${API_BASE_URL}/pedidos`, {
        cache: 'no-store',
      });
      return await handleResponse<OrderSummary[]>(res);
    } catch {
      return fallbackStore.getOrders();
    }
  },
};
