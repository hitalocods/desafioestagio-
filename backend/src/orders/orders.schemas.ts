import { z } from 'zod';
import { bookingMetadataSchema } from '../cart/cart.schemas';

export const checkoutItemOverrideSchema = z.object({
  productId: z.string().uuid('ID de produto inválido'),
  quantity: z.number().int().min(1).max(99),
  booking: bookingMetadataSchema.optional(),
});

export const checkoutSchema = z.object({
  customerName: z
    .string()
    .min(3, 'Informe seu nome completo (mínimo 3 caracteres)')
    .max(140, 'Nome muito longo'),
  customerEmail: z
    .string()
    .email('Informe um endereço de e-mail válido para receber a confirmação'),
  customerPhone: z
    .string()
    .min(8, 'Informe um telefone válido')
    .max(30)
    .optional()
    .or(z.literal('')),
  shippingAddress: z
    .string()
    .max(300, 'Endereço muito longo')
    .optional()
    .or(z.literal('')),
  paymentMethod: z
    .enum(['PIX', 'CREDIT_CARD', 'BOLETO'], {
      errorMap: () => ({
        message: 'Método de pagamento inválido (PIX, CREDIT_CARD ou BOLETO)',
      }),
    })
    .default('PIX'),
  // Opcionalmente permite enviar os itens diretamente no body do POST /finalizar-compra
  // caso o cliente não esteja usando a sessão em memória do servidor
  items: z.array(checkoutItemOverrideSchema).optional(),
});

export type CheckoutDto = z.infer<typeof checkoutSchema>;

