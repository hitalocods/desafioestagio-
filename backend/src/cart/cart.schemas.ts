import { z } from 'zod';

export const bookingMetadataSchema = z.object({
  checkInDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'A data de check-in deve estar no formato YYYY-MM-DD'),
  checkInTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'O horário deve estar no formato HH:MM'),
  guests: z
    .number()
    .int()
    .min(1, 'Mínimo de 1 participante/hóspede')
    .max(20, 'Máximo de 20 participantes por reserva')
    .default(1),
  notes: z
    .string()
    .max(300, 'Observações devem ter no máximo 300 caracteres')
    .optional(),
});

export type BookingMetadata = z.infer<typeof bookingMetadataSchema>;

export const addToCartSchema = z.object({
  productId: z.string().uuid('ID do produto inválido'),
  quantity: z
    .number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Quantidade mínima é 1')
    .max(50, 'Quantidade máxima por adição é 50')
    .default(1),
  booking: bookingMetadataSchema.optional(),
});

export type AddToCartDto = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z
  .object({
    itemId: z.string().optional(),
    productId: z.string().uuid('ID do produto inválido').optional(),
    quantity: z
      .number()
      .int('Quantidade deve ser um número inteiro')
      .min(0, 'A quantidade não pode ser negativa (use 0 para remover)')
      .max(99, 'Quantidade máxima permitida é 99'),
  })
  .refine((data) => Boolean(data.itemId || data.productId), {
    message: 'É necessário informar itemId ou productId para atualizar o carrinho',
    path: ['itemId'],
  });

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;

export interface CartItem {
  itemId: string;
  productId: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  type: 'PHYSICAL' | 'BOOKING';
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

