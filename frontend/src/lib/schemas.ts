import { z } from 'zod';

export const bookingFormSchema = z.object({
  checkInDate: z
    .string()
    .min(1, 'Selecione a data do check-in / agendamento')
    .refine(
      (val) => {
        const selected = new Date(`${val}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      { message: 'A data de check-in não pode estar no passado' },
    ),
  checkInTime: z.string().min(1, 'Escolha um horário disponível'),
  guests: z
    .number({ invalid_type_error: 'Informe um número válido' })
    .int()
    .min(1, 'Mínimo de 1 pessoa')
    .max(20, 'Máximo de 20 pessoas por reserva'),
  quantity: z
    .number({ invalid_type_error: 'Informe a quantidade' })
    .int()
    .min(1, 'Mínimo de 1 reserva/diária')
    .max(15, 'Máximo de 15 diárias/sessões por vez'),
  notes: z
    .string()
    .max(300, 'Máximo de 300 caracteres')
    .optional(),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const createCheckoutFormSchema = (hasPhysicalItems: boolean) =>
  z
    .object({
      customerName: z
        .string()
        .min(3, 'Digite seu nome completo (mínimo 3 caracteres)')
        .max(140, 'Nome muito longo'),
      customerEmail: z
        .string()
        .email('Digite um e-mail válido para receber o comprovante'),
      customerPhone: z
        .string()
        .min(8, 'Informe um telefone/WhatsApp válido')
        .max(30, 'Telefone inválido'),
      shippingAddress: z.string().optional(),
      paymentMethod: z.enum(['PIX', 'CREDIT_CARD', 'BOLETO'], {
        required_error: 'Escolha uma forma de pagamento',
      }),
    })
    .superRefine((data, ctx) => {
      if (
        hasPhysicalItems &&
        (!data.shippingAddress || data.shippingAddress.trim().length < 8)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['shippingAddress'],
          message:
            'Informe o endereço completo de entrega para os produtos físicos',
        });
      }
    });

export type CheckoutFormValues = z.infer<
  ReturnType<typeof createCheckoutFormSchema>
>;

