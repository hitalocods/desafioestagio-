'use client';

import {
  CalendarClock,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Minus,
  Package,
  Plus,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types/ecommerce';
import { formatCurrency } from '@/lib/utils';

interface ProductQuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddPhysicalWithQty: (product: Product, quantity: number) => Promise<void>;
  onOpenBookingModal: (product: Product) => void;
  isAdding: boolean;
}

export function ProductQuickViewModal({
  product,
  onClose,
  onAddPhysicalWithQty,
  onOpenBookingModal,
  isAdding,
}: ProductQuickViewModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  if (!product) return null;

  const isBooking = product.type === 'BOOKING';
  const outOfStock = product.stock <= 0;
  const pixPrice = product.price * 0.9;
  const installmentPrice = product.price / 12;

  const handleAction = async () => {
    if (outOfStock) return;
    if (isBooking) {
      onClose();
      onOpenBookingModal(product);
      return;
    }
    await onAddPhysicalWithQty(product, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Imagem em destaque */}
          <div className="md:col-span-6 relative bg-slate-100 min-h-[280px] sm:min-h-[380px]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {isBooking ? (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-violet-600 text-white shadow-lg">
                  <CalendarClock className="w-3.5 h-3.5" />
                  Experiência Booking
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-900 text-white shadow-lg">
                  <Package className="w-3.5 h-3.5" />
                  Produto Oficial
                </span>
              )}
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/70 text-white backdrop-blur-md">
                {product.category}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-amber-600 shadow">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} (120+ avaliações)
              </span>
            </div>
          </div>

          {/* Detalhes e Compra */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curadoria Oficial NovaStore</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Bloco de Preços Estilo E-commerce Real */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through block">
                      {formatCurrency(product.price * 1.15)}
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {isBooking ? '/ reserva' : '/ unidade'}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                    10% OFF no PIX
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
                    <QrCode className="w-3.5 h-3.5" />
                    <strong>{formatCurrency(pixPrice)}</strong> à vista no PIX
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                    12x de <strong>{formatCurrency(installmentPrice)}</strong>{' '}
                    sem juros
                  </span>
                </div>
              </div>

              {/* Informações de Logística ou Horários de Booking */}
              {product.locationOrDuration && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-indigo-50/60 border border-indigo-100 px-3.5 py-2.5 rounded-xl">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium">
                    {product.locationOrDuration}
                  </span>
                </div>
              )}

              {isBooking && product.availableSlots && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                    Horários de Check-in Disponíveis
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {product.availableSlots.map((slot) => (
                      <span
                        key={slot}
                        className="px-3 py-1 rounded-lg bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold"
                      >
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Benefícios da Loja */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {isBooking
                      ? 'Voucher imediato por e-mail'
                      : 'Frete Expresso Grátis'}
                  </span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Compra 100% Garantida</span>
                </div>
              </div>
            </div>

            {/* Ação de Compra */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {!isBooking && (
                <div className="inline-flex items-center justify-between sm:justify-center rounded-2xl border border-slate-300 bg-slate-50 px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-slate-600 hover:text-indigo-600 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 text-sm font-extrabold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="p-2 text-slate-600 hover:text-indigo-600 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                type="button"
                disabled={outOfStock || isAdding}
                onClick={handleAction}
                className={`flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                  addedFeedback
                    ? 'bg-emerald-600 shadow-emerald-600/25'
                    : isBooking
                      ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/25'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4" />
                    Adicionado ao Carrinho!
                  </>
                ) : isBooking ? (
                  <>
                    <CalendarClock className="w-4 h-4" />
                    Selecionar Data e Horário de Check-in
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Adicionar ao Carrinho •{' '}
                    {formatCurrency(product.price * quantity)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

