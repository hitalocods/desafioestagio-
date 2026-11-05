'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CalendarClock,
  Clock,
  FileText,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BookingFormValues, bookingFormSchema } from '@/lib/schemas';
import { formatCurrency } from '@/lib/utils';
import { BookingMetadata, Product } from '@/types/ecommerce';

interface BookingModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirmBooking: (
    product: Product,
    quantity: number,
    booking: BookingMetadata,
  ) => Promise<void>;
  isSubmitting: boolean;
}

export function BookingModal({
  product,
  onClose,
  onConfirmBooking,
  isSubmitting,
}: BookingModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      checkInDate: defaultDate,
      checkInTime: product?.availableSlots?.[0] || '14:00',
      guests: 2,
      quantity: 1,
      notes: '',
    },
  });

  useEffect(() => {
    if (product) {
      reset({
        checkInDate: defaultDate,
        checkInTime: product.availableSlots?.[0] || '14:00',
        guests: 2,
        quantity: 1,
        notes: '',
      });
    }
  }, [product, defaultDate, reset]);

  if (!product) return null;

  const selectedTime = watch('checkInTime');
  const selectedQuantity = watch('quantity') || 1;
  const estimatedSubtotal = product.price * selectedQuantity;

  const onSubmit = async (values: BookingFormValues) => {
    await onConfirmBooking(product, values.quantity, {
      checkInDate: values.checkInDate,
      checkInTime: values.checkInTime,
      guests: values.guests,
      notes: values.notes?.trim() ? values.notes.trim() : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-sm">
                <CalendarClock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-200">
                  Reserva & Check-in Online
                </span>
                <h2 className="text-lg font-bold leading-snug">
                  {product.name}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {product.locationOrDuration && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-100">
              <MapPin className="w-3.5 h-3.5" />
              <span>{product.locationOrDuration}</span>
            </div>
          )}
        </div>

        {/* Form com React Hook Form + Zod */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-violet-600" />
                  Data do Check-in *
                </span>
              </label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                {...register('checkInDate')}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
              />
              {errors.checkInDate && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.checkInDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-violet-600" />
                  Participantes / Hóspedes *
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={20}
                {...register('guests', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
              />
              {errors.guests && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  {errors.guests.message}
                </p>
              )}
            </div>
          </div>

          {/* Seleção de Horário de Check-in */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-600" />
                Horário de Check-in Disponível *
              </span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {(product.availableSlots || ['10:00', '14:00', '16:00']).map(
                (slot) => {
                  const active = selectedTime === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setValue('checkInTime', slot, { shouldValidate: true })
                      }
                      className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                        active
                          ? 'bg-violet-600 text-white border-violet-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-300 hover:bg-violet-50/50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                },
              )}
            </div>
            {errors.checkInTime && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.checkInTime.message}
              </p>
            )}
          </div>

          {/* Quantidade de Diárias / Sessões */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quantidade de Diárias / Sessões *
            </label>
            <input
              type="number"
              min={1}
              max={product.stock}
              {...register('quantity', { valueAsNumber: true })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
                Observações ou Solicitações Especiais (Opcional)
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Restrição alimentar, equipamento extra, chegada antecipada..."
              {...register('notes')}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
            {errors.notes && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Resumo de Valor */}
          <div className="bg-violet-50/80 border border-violet-100 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-violet-700 font-medium block">
                Subtotal da Reserva ({selectedQuantity}x{' '}
                {formatCurrency(product.price)})
              </span>
              <span className="text-lg font-extrabold text-violet-950">
                {formatCurrency(estimatedSubtotal)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Adicionando...' : 'Confirmar e Ir ao Carrinho'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

