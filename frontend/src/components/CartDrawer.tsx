'use client';

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Sparkles,
  Tag,
  Trash2,
  Truck,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { CartItem, CartState } from '@/types/ecommerce';
import { formatCurrency, formatDateBR } from '@/lib/utils';

const FREE_SHIPPING_THRESHOLD = 299;

const COUPONS: Record<string, { discountPercent: number; label: string }> = {
  BEMVINDO10: { discountPercent: 10, label: '10% OFF Boas-Vindas' },
  DEV15: { discountPercent: 15, label: '15% OFF Avaliador FullStack' },
  NOVASTORE5: { discountPercent: 5, label: '5% OFF Cupom Loja' },
};

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartState | undefined;
  onUpdateQuantity: (item: CartItem, newQuantity: number) => void;
  onRemoveItem: (item: CartItem) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  isUpdating: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  isUpdating,
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  if (!isOpen) return null;

  const items = cart?.items ?? [];
  const rawSubtotal = cart?.totalAmount ?? 0;
  const totalItems = cart?.totalItems ?? 0;

  const activeCouponObj = appliedCoupon ? COUPONS[appliedCoupon] : null;
  const discountAmount = activeCouponObj
    ? (rawSubtotal * activeCouponObj.discountPercent) / 100
    : 0;
  const finalTotal = Math.max(0, rawSubtotal - discountAmount);

  const missingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - rawSubtotal,
  );
  const shippingProgress = Math.min(
    100,
    (rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100,
  );

  const handleApplyCoupon = () => {
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido. Tente BEMVINDO10 ou DEV15');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col relative z-10">
          {/* Cabeçalho */}
          <div className="px-6 py-5 bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Sacola de Compras
                </h2>
                <p className="text-xs text-slate-400">
                  {totalItems}{' '}
                  {totalItems === 1
                    ? 'item selecionado'
                    : 'itens selecionados'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-slate-300 hover:text-rose-400 px-2.5 py-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Esvaziar
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de Progresso de Frete Expresso Grátis */}
          {items.length > 0 && (
            <div className="px-6 py-3 bg-indigo-50/80 border-b border-indigo-100">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-950 mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-indigo-600" />
                  {missingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 font-bold">
                      Parabéns! Você ganhou Frete Expresso Grátis + Seguro!
                    </span>
                  ) : (
                    <span>
                      Faltam{' '}
                      <strong>{formatCurrency(missingForFreeShipping)}</strong>{' '}
                      para Frete Expresso VIP
                    </span>
                  )}
                </span>
                <span className="text-[11px] font-bold text-indigo-600">
                  {Math.round(shippingProgress)}%
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-indigo-200/70 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                  <ShoppingBag className="w-9 h-9" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Sua sacola está vazia
                </h3>
                <p className="mt-1.5 text-sm text-slate-500 max-w-xs leading-relaxed">
                  Explore nossa vitrine de equipamentos premium ou agende uma
                  experiência com check-in online.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-indigo-600 transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.itemId}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-200 transition-all shadow-sm"
                >
                  <div className="flex gap-3.5">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(item)}
                          disabled={isUpdating}
                          title="Remover item"
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        {item.type === 'BOOKING' ? (
                          <span className="inline-flex items-center gap-1 text-violet-700 font-bold">
                            <CalendarClock className="w-3.5 h-3.5" />
                            Booking
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                            <Package className="w-3.5 h-3.5" />
                            Físico
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatCurrency(item.unitPrice)} / un.</span>
                      </div>

                      {/* Detalhes do Agendamento (Booking) */}
                      {item.booking && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-violet-50/90 border border-violet-200/70 text-xs text-violet-950 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                            <span>
                              Check-in:{' '}
                              {formatDateBR(item.booking.checkInDate)} às{' '}
                              {item.booking.checkInTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-violet-700 font-medium">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {item.booking.guests}{' '}
                              {item.booking.guests > 1
                                ? 'participantes/hóspedes'
                                : 'participante/hóspede'}
                            </span>
                          </div>
                          {item.booking.notes && (
                            <div className="text-[11px] italic text-violet-600">
                              &ldquo;{item.booking.notes}&rdquo;
                            </div>
                          )}
                        </div>
                      )}

                      {/* Controles de Quantidade e Subtotal Individual */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item, item.quantity - 1)
                            }
                            disabled={isUpdating}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-40 cursor-pointer"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-extrabold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateQuantity(item, item.quantity + 1)
                            }
                            disabled={isUpdating}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 disabled:opacity-40 cursor-pointer"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                            Subtotal
                          </span>
                          <span className="text-sm font-black text-slate-900">
                            {formatCurrency(item.subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé com Cupom, Valor Total e Botão Finalizar */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50/90 space-y-4">
              {/* Campo de Cupom Promocional */}
              <div>
                {appliedCoupon && activeCouponObj ? (
                  <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <span className="inline-flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Cupom {appliedCoupon} ({activeCouponObj.label})
                    </span>
                    <button
                      type="button"
                      onClick={() => setAppliedCoupon(null)}
                      className="text-emerald-700 hover:text-rose-600 font-bold cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Cupom (ex: BEMVINDO10 ou DEV15)"
                          className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium uppercase focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] font-medium text-rose-600">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span className="font-semibold text-slate-700">
                    {formatCurrency(rawSubtotal)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>Desconto Promocional ({appliedCoupon})</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-slate-500">
                  <span>Entrega / Taxa de Reserva</span>
                  <span className="text-emerald-600 font-bold">Cortesia</span>
                </div>
                <div className="pt-2.5 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block">
                      Total da Compra
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Em até 12x de {formatCurrency(finalTotal / 12)} sem juros
                    </span>
                  </div>
                  <span className="text-2xl font-black text-indigo-600">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onProceedToCheckout}
                className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Finalizar Compra Segura</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
