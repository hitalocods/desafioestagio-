'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { BookingMetadata, CartState, ProductType } from '@/types/ecommerce';
import { CheckoutFormValues } from '@/lib/schemas';

export function useProductsQuery(filters: {
  type?: ProductType | 'ALL';
  category?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.getProducts(filters),
  });
}

export function useCartQuery(sessionId: string) {
  return useQuery({
    queryKey: ['cart', sessionId],
    queryFn: () => api.getCart(sessionId),
    enabled: Boolean(sessionId),
  });
}

export function useOrdersQuery(enabled = true) {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => api.getOrders(),
    enabled,
  });
}

export function useCartMutations(sessionId: string) {
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: (payload: {
      productId: string;
      quantity: number;
      booking?: BookingMetadata;
    }) => api.addToCart(sessionId, payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', sessionId], updatedCart);
    },
  });

  const updateCartItem = useMutation({
    mutationFn: (payload: { itemId: string; quantity: number }) =>
      api.updateCartItem(sessionId, payload),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', sessionId], updatedCart);
    },
  });

  const clearCart = useMutation({
    mutationFn: () => api.clearCart(sessionId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart', sessionId], updatedCart);
    },
  });

  const checkout = useMutation({
    mutationFn: (payload: CheckoutFormValues) => {
      const currentCart = queryClient.getQueryData<CartState>(['cart', sessionId]);
      const itemsFallback = currentCart?.items?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        booking: item.booking,
      }));
      return api.checkout(sessionId, {
        ...payload,
        ...(itemsFallback && itemsFallback.length > 0 ? { items: itemsFallback } : {}),
      } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    addToCart,
    updateCartItem,
    clearCart,
    checkout,
  };
}

