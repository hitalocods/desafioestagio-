'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreditCard,
  Lock,
  Mail,
  MapPin,
  Phone,
  QrCode,
  Receipt,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  CheckoutFormValues,
  createCheckoutFormSchema,
} from '@/lib/schemas';
import { formatCurrency } from '@/lib/utils';
import { CartState } from '@/types/ecommerce';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState | undefined;
  onConfirmOrder: (values: CheckoutFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError: string | null;
}

export function CheckoutModal({
  isOpen,
  onClose,
  cart,
  onConfirmOrder,
  isSubmitting,
  serverError,
}: CheckoutModalProps) {
  const items = cart?.items ?? [];
  const hasPhysicalItems = items.some((item) => item.type === 'PHYSICAL');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(createCheckoutFormSchema(hasPhysicalItems)),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      shippingAddress: '',
      paymentMethod: 'PIX',
    },
  });

  if (!isOpen || !cart) return null;

  const selectedPayment = watch('paymentMethod');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Cabeçalho */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Finalizar Compra Segura</h2>
              <p className="text-xs text-slate-400">
                Preencha seus dados para registrar o pedido e receber a
                confirmação por e-mail
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onConfirmOrder)}
          className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
        >
          {serverError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
              {serverError}
            </div>
          )}

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Nome Completo *
                </span>
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                {...register('customerName')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  E-mail para Confirmação *
                </span>
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                {...register('customerEmail')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerEmail && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.customerEmail.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  Telefone / WhatsApp *
                </span>
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-8888"
                {...register('customerPhone')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Endereço de Entrega / Faturamento{' '}
                {hasPhysicalItems ? '*' : '(Opcional para apenas Booking)'}
              </span>
            </label>
            <input
              type="text"
              placeholder="Rua, Número, Complemento, Bairro, Cidade - UF, CEP"
              {...register('shippingAddress')}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
            {errors.shippingAddress && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.shippingAddress.message}
              </p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'PIX', label: 'PIX Instantâneo', icon: QrCode },
                { id: 'CREDIT_CARD', label: 'Cartão de Crédito', icon: CreditCard },
                { id: 'BOLETO', label: 'Boleto Bancário', icon: Receipt },
              ].map((method) => {
                const Icon = method.icon;
                const active = selectedPayment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() =>
                      setValue(
                        'paymentMethod',
                        method.id as 'PIX' | 'CREDIT_CARD' | 'BOLETO',
                        { shouldValidate: true },
                      )
                    }
                    className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        active ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo Rápido dos Itens */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumo do Pedido ({cart.totalItems} itens)
            </div>
            <div className="max-h-36 overflow-y-auto divide-y divide-slate-200/70 text-xs">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="py-2 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    {item.booking && (
                      <span className="ml-2 text-violet-700 font-medium">
                        (Check-in: {item.booking.checkInDate} às{' '}
                        {item.booking.checkInTime})
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">
                Total a Pagar
              </span>
              <span className="text-xl font-extrabold text-indigo-600">
                {formatCurrency(cart.totalAmount)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Voltar ao Carrinho
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              {isSubmitting
                ? 'Processando Compra...'
                : `Confirmar Compra (${formatCurrency(cart.totalAmount)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

