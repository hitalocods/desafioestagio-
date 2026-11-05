'use client';

import {
  CalendarClock,
  Check,
  CreditCard,
  Eye,
  Heart,
  MapPin,
  Package,
  ShoppingCart,
  Star,
} from 'lucide-react';
import { useState } from 'react';
import { Product } from '@/types/ecommerce';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddPhysical: (product: Product) => Promise<void>;
  onOpenBookingModal: (product: Product) => void;
  onOpenQuickView: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  isAdding: boolean;
}

export function ProductCard({
  product,
  onAddPhysical,
  onOpenBookingModal,
  onOpenQuickView,
  isFavorite,
  onToggleFavorite,
  isAdding,
}: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const isBooking = product.type === 'BOOKING';
  const outOfStock = product.stock <= 0;
  const installmentPrice = product.price / 12;

  const handleAction = async () => {
    if (outOfStock) return;
    if (isBooking) {
      onOpenBookingModal(product);
      return;
    }
    await onAddPhysical(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article className="group relative flex flex-col bg-white rounded-xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-slate-900/10 sm:hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Container da Imagem */}
      <div className="relative aspect-[4/3] sm:aspect-auto sm:h-56 w-full bg-slate-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          onClick={() => onOpenQuickView(product)}
          className="h-full w-full object-cover sm:group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          loading="lazy"
        />

        {/* Overlay Gradiente sutil */}
        <div
          onClick={() => onOpenQuickView(product)}
          className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent opacity-70 cursor-pointer"
        />

        {/* Topo: Badge de Tipo + Favoritar */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex items-center justify-between gap-1">
          {isBooking ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-violet-600/95 text-white shadow-xs backdrop-blur-md">
              <CalendarClock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>Booking</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold bg-slate-900/85 text-white shadow-xs backdrop-blur-md">
              <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span>Físico</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => onToggleFavorite(product.id)}
            aria-label="Salvar nos favoritos"
            className={`p-1.5 sm:p-2 rounded-full shadow-xs backdrop-blur-md transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 hover:bg-white text-slate-700 hover:text-rose-500'
            }`}
          >
            <Heart
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                isFavorite ? 'fill-white' : ''
              }`}
            />
          </button>
        </div>

        {/* Botão Flutuante "Espiar Produto" no Hover (Desktop) */}
        <button
          type="button"
          onClick={() => onOpenQuickView(product)}
          className="hidden sm:flex absolute inset-x-4 bottom-11 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-bold text-xs shadow-lg items-center justify-center gap-1.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-indigo-600" />
          <span>Ver Detalhes</span>
        </button>

        {/* Base da Imagem: Nota e Estoque */}
        <div className="absolute bottom-1.5 left-2 right-2 sm:bottom-2.5 sm:left-3 sm:right-3 flex items-center justify-between gap-1 pointer-events-none">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] sm:text-[11px] font-bold bg-black/55 text-white backdrop-blur-xs">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
          </span>
          <span
            className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold ${
              outOfStock
                ? 'bg-rose-600/95 text-white'
                : 'bg-emerald-600/90 text-white'
            }`}
          >
            {outOfStock ? 'Esgotado' : `${product.stock} disp.`}
          </span>
        </div>
      </div>

      {/* Corpo do Card */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-4">
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 truncate">
          {product.category}
        </span>

        <button
          type="button"
          onClick={() => onOpenQuickView(product)}
          className="text-left cursor-pointer mt-0.5"
        >
          <h3 className="text-xs sm:text-[15px] font-bold text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight min-h-[2rem] sm:min-h-[2.4rem]">
            {product.name}
          </h3>
        </button>

        <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed hidden sm:block">
          {product.description}
        </p>

        {product.locationOrDuration && (
          <div className="mt-1.5 sm:mt-2.5 hidden sm:flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
            <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
            <span className="truncate font-medium">
              {product.locationOrDuration}
            </span>
          </div>
        )}

        {/* Bloco de Preço + Parcelamento + Botão */}
        <div className="mt-auto pt-2 sm:pt-3 border-t border-slate-100 space-y-2">
          <div>
            <span className="text-[9px] sm:text-[11px] text-slate-400 line-through block leading-none">
              {formatCurrency(product.price * 1.15)}
            </span>
            <div className="flex items-baseline justify-between gap-1 mt-0.5">
              <span className="text-sm sm:text-lg font-black text-slate-900 tracking-tight leading-none">
                {formatCurrency(product.price)}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                -10% PIX
              </span>
            </div>
            <span className="text-[9px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 leading-none">
              <CreditCard className="w-2.5 h-2.5 shrink-0 hidden sm:inline" />
              <span>12x {formatCurrency(installmentPrice)}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleAction}
            disabled={outOfStock || isAdding}
            className={`w-full py-2 sm:py-2.5 px-2 sm:px-3.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : isBooking
                  ? 'bg-violet-600 hover:bg-violet-700 text-white'
                  : 'bg-slate-900 hover:bg-indigo-600 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>Adicionado</span>
              </>
            ) : isBooking ? (
              <>
                <CalendarClock className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Agendar</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Comprar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
