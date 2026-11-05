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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full sm:max-w-2xl max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-slate-900 px-4 py-4 sm:px-6 sm:py-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-sm sm:text-lg font-extrabold">
                Finalizar Compra Segura
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Receba seu comprovante imediato por e-mail
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
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5"
        >
          {serverError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {serverError}
            </div>
          )}

          {/* Dados do Cliente */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  Nome Completo *
                </span>
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                {...register('customerName')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerName && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.customerName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  E-mail para Confirmação *
                </span>
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                {...register('customerEmail')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerEmail && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.customerEmail.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  Telefone / WhatsApp *
                </span>
              </label>
              <input
                type="tel"
                placeholder="(11) 99999-8888"
                {...register('customerPhone')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>
          </div>

          {/* Endereço de Entrega */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                Endereço{' '}
                {hasPhysicalItems ? 'de Entrega *' : '(Opcional para Booking)'}
              </span>
            </label>
            <input
              type="text"
              placeholder="Rua, Número, Bairro, Cidade - UF"
              {...register('shippingAddress')}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-base sm:text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
            />
            {errors.shippingAddress && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.shippingAddress.message}
              </p>
            )}
          </div>

          {/* Método de Pagamento */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'PIX', label: 'PIX', fullLabel: 'PIX Instantâneo', icon: QrCode },
                { id: 'CREDIT_CARD', label: 'Cartão', fullLabel: 'Cartão de Crédito', icon: CreditCard },
                { id: 'BOLETO', label: 'Boleto', fullLabel: 'Boleto Bancário', icon: Receipt },
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
                    className={`p-2.5 sm:p-3 rounded-xl border text-center sm:text-left flex flex-col items-center sm:items-start gap-1 sm:gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-2 ring-indigo-600/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        active ? 'text-indigo-600' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-[11px] sm:hidden font-bold">
                      {method.label}
                    </span>
                    <span className="hidden sm:inline text-xs font-bold">
                      {method.fullLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resumo Rápido dos Itens */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 sm:p-4 space-y-2">
            <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
              Resumo do Pedido ({cart.totalItems} itens)
            </div>
            <div className="max-h-28 overflow-y-auto divide-y divide-slate-200/70 text-xs">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className="py-1.5 flex items-center justify-between gap-2"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">
                      {item.quantity}x {item.name}
                    </span>
                    {item.booking && (
                      <span className="ml-1.5 text-violet-700 font-medium text-[11px]">
                        ({item.booking.checkInDate} • {item.booking.checkInTime})
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
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Total a Pagar
              </span>
              <span className="text-lg sm:text-xl font-black text-indigo-600">
                {formatCurrency(cart.totalAmount)}
              </span>
            </div>
          </div>

          {/* Botões Empilhados no Mobile / Lado a Lado no Desktop */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-1.5 py-3 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="truncate">
                {isSubmitting ? 'Processando...' : 'Confirmar Compra'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
