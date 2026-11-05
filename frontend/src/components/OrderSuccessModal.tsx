'use client';

import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  MailCheck,
  PackageCheck,
  X,
} from 'lucide-react';
import { OrderResponse } from '@/types/ecommerce';
import { formatCurrency, formatDateBR } from '@/lib/utils';

interface OrderSuccessModalProps {
  orderResponse: OrderResponse | null;
  onClose: () => void;
}

export function OrderSuccessModal({
  orderResponse,
  onClose,
}: OrderSuccessModalProps) {
  if (!orderResponse) return null;

  const { order, email } = orderResponse;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Topo Verde de Sucesso */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mx-auto w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-100">
            Venda Registrada no Banco de Dados
          </span>
          <h2 className="text-2xl font-extrabold mt-1">
            Pedido #{order.orderNumber} Confirmado!
          </h2>
          <p className="mt-1 text-sm text-emerald-50">
            Obrigado, <strong>{order.customerName}</strong>! Sua compra foi
            concluída com sucesso.
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Card de Confirmação de E-mail */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
              <MailCheck className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs text-indigo-950 space-y-1">
              <div className="font-bold text-sm">
                E-mail de confirmação enviado!
              </div>
              <p className="text-indigo-800">
                Enviamos o comprovante detalhado para{' '}
                <strong>{email.recipient}</strong>.
              </p>
              {email.previewUrl && (
                <a
                  href={email.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
                >
                  <span>Abrir E-mail Enviado (Ethereal Preview)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Itens Comprados */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              Itens do Pedido
            </h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="p-3.5 bg-white text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>
                      {item.quantity}x {item.productName}
                    </span>
                    <span>{formatCurrency(item.subtotal)}</span>
                  </div>
                  {item.bookingDetails && (
                    <div className="inline-flex items-center gap-1.5 text-violet-700 bg-violet-50 px-2.5 py-1 rounded-md font-medium">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Check-in: {formatDateBR(item.bookingDetails.checkInDate)}{' '}
                      às {item.bookingDetails.checkInTime} (
                      {item.bookingDetails.guests} pessoas)
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">
                Pagamento via {order.paymentMethod}
              </span>
              <span className="text-sm font-semibold">Valor Total Pago</span>
            </div>
            <span className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors cursor-pointer"
          >
            Continuar Comprando na Loja
          </button>
        </div>
      </div>
    </div>
  );
}

