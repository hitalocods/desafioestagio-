'use client';

import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Mail,
  Package,
  Receipt,
  X,
} from 'lucide-react';
import { useOrdersQuery } from '@/hooks/useEcommerce';
import { formatCurrency, formatDateBR } from '@/lib/utils';

interface OrdersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrdersHistoryModal({
  isOpen,
  onClose,
}: OrdersHistoryModalProps) {
  const { data: orders = [], isLoading } = useOrdersQuery(isOpen);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold">
                Meus Pedidos & Reservas
              </h2>
              <p className="text-xs text-slate-400">
                Histórico em tempo real consultado diretamente do banco de dados
                relacional
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lista de Pedidos */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4 bg-slate-50/60">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Nenhum pedido finalizado ainda
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                Assim que você concluir uma compra, o registro do banco de dados
                e o link do e-mail de confirmação aparecerão aqui.
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
              >
                <div className="px-5 py-3.5 bg-slate-900/5 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-extrabold">
                      #{order.orderNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {order.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {new Date(order.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 mr-1.5">
                      Total ({order.paymentMethod}):
                    </span>
                    <span className="text-base font-black text-indigo-600">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                    <div>
                      <strong>Cliente:</strong> {order.customerName} (
                      {order.customerEmail})
                    </div>
                    {order.emailPreviewUrl && (
                      <a
                        href={order.emailPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Visualizar E-mail Enviado</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl bg-slate-50/60">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            {item.productType === 'BOOKING' ? (
                              <CalendarClock className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                            ) : (
                              <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            )}
                            <span>
                              {item.quantity}x {item.productName}
                            </span>
                          </div>
                          {item.bookingDetails && (
                            <div className="text-[11px] font-medium text-violet-700 pl-5">
                              Check-in:{' '}
                              {formatDateBR(item.bookingDetails.checkInDate)} às{' '}
                              {item.bookingDetails.checkInTime} (
                              {item.bookingDetails.guests} pessoas)
                            </div>
                          )}
                        </div>
                        <span className="font-extrabold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

