'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CalendarClock,
  Clock,
  FileText,
  MapPin,
  Minus,
  Plus,
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
  const selectedGuests = watch('guests') || 1;
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header Compacto */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-4 sm:p-6 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs shrink-0">
                <CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-violet-200 block">
                  Reserva & Check-in Online
                </span>
                <h2 className="text-sm sm:text-lg font-extrabold leading-snug line-clamp-2">
                  {product.name}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {product.locationOrDuration && (
            <div className="mt-2 flex items-center gap-1.5 text-[11px] sm:text-xs text-violet-100 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{product.locationOrDuration}</span>
            </div>
          )}
        </div>

        {/* Form com Scroll Interno no Mobile */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {/* Data de Check-in */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-violet-600" />
                Data do Check-in *
              </span>
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('checkInDate')}
              className="w-full rounded-xl border border-slate-300 bg-slate-50/60 px-3.5 py-2.5 text-base sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
            {errors.checkInDate && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.checkInDate.message}
              </p>
            )}
          </div>

          {/* Seleção de Horário de Check-in */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-violet-600" />
                Escolha o Horário de Check-in *
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
                      className={`py-2.5 px-2 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        active
                          ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-600/20 ring-2 ring-violet-600/20'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      <Clock className="w-3 h-3 shrink-0 opacity-80" />
                      <span>{slot}</span>
                    </button>
                  );
                },
              )}
            </div>
            {errors.checkInTime && (
              <p className="mt-1 text-xs font-medium text-rose-600">
                {errors.checkInTime.message}
              </p>
            )}
          </div>

          {/* Participantes e Quantidade de Diárias/Sessões lado a lado com botões +/- fáceis no touch */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-violet-600" />
                  Pessoas / Hóspedes
                </span>
              </label>
              <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-2 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setValue('guests', Math.max(1, selectedGuests - 1), {
                      shouldValidate: true,
                    })
                  }
                  className="p-1.5 text-slate-600 hover:text-violet-600 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-slate-900">
                  {selectedGuests}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setValue('guests', Math.min(20, selectedGuests + 1), {
                      shouldValidate: true,
                    })
                  }
                  className="p-1.5 text-slate-600 hover:text-violet-600 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.guests && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">
                  {errors.guests.message}
                </p>
              )}
            </div>

            <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <label className="block text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Diárias / Sessões
              </label>
              <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-2 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setValue('quantity', Math.max(1, selectedQuantity - 1), {
                      shouldValidate: true,
                    })
                  }
                  className="p-1.5 text-slate-600 hover:text-violet-600 cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-extrabold text-slate-900">
                  {selectedQuantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setValue(
                      'quantity',
                      Math.min(product.stock, selectedQuantity + 1),
                      { shouldValidate: true },
                    )
                  }
                  className="p-1.5 text-slate-600 hover:text-violet-600 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.quantity && (
                <p className="mt-1 text-[11px] font-medium text-rose-600">
                  {errors.quantity.message}
                </p>
              )}
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-violet-600" />
                Observações Especiais (Opcional)
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Chegada antecipada, equipamento extra..."
              {...register('notes')}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-base sm:text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
          </div>

          {/* Rodapé de Ação e Subtotal Responsivo (Empilhado no Mobile, Lado a Lado no Desktop) */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex sm:block items-baseline justify-between bg-violet-50/80 sm:bg-transparent px-3.5 py-2 sm:p-0 rounded-xl">
              <span className="text-xs text-violet-700 font-semibold block">
                Total ({selectedQuantity}x {formatCurrency(product.price)})
              </span>
              <span className="text-lg sm:text-xl font-black text-violet-950">
                {formatCurrency(estimatedSubtotal)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-3 px-5 rounded-xl text-xs sm:text-sm font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Salvando...' : 'Confirmar Check-in'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
