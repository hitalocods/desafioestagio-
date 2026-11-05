'use client';

import {
  ArrowUpDown,
  Award,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Headphones,
  Heart,
  Layers,
  Package,
  RefreshCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { BookingModal } from '@/components/BookingModal';
import { BrandLogo } from '@/components/BrandLogo';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { OrdersHistoryModal } from '@/components/OrdersHistoryModal';
import { ProductCard } from '@/components/ProductCard';
import { ProductQuickViewModal } from '@/components/ProductQuickViewModal';
import { useDebounce } from '@/hooks/useDebounce';
import {
  useCartMutations,
  useCartQuery,
  useOrdersQuery,
  useProductsQuery,
} from '@/hooks/useEcommerce';
import { useSessionId } from '@/hooks/useSessionId';
import { CheckoutFormValues } from '@/lib/schemas';
import { formatCurrency } from '@/lib/utils';
import {
  BookingMetadata,
  CartItem,
  OrderResponse,
  Product,
  ProductType,
} from '@/types/ecommerce';

type SortOption = 'FEATURED' | 'PRICE_ASC' | 'PRICE_DESC' | 'RATING_DESC';

export default function HomePage() {
  const sessionId = useSessionId();

  // Filtros e Ordenação de Loja Real
  const [selectedType, setSelectedType] = useState<ProductType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('FEATURED');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 250);

  // Estados de UI (Modais / Drawer / Toast)
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersHistoryOpen, setIsOrdersHistoryOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [bookingProduct, setBookingProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderResponse | null>(
    null,
  );
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Queries e Mutations (TanStack Query)
  const {
    data: rawProducts = [],
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useProductsQuery({
    type: selectedType,
    search: debouncedSearch,
  });

  const { data: cart } = useCartQuery(sessionId);
  const { data: orders = [] } = useOrdersQuery(true);
  const { addToCart, updateCartItem, clearCart, checkout } =
    useCartMutations(sessionId);

  // Extrai categorias únicas dinamicamente
  const categories = useMemo(() => {
    const set = new Set<string>();
    rawProducts.forEach((p) => set.add(p.category));
    return ['ALL', ...Array.from(set)];
  }, [rawProducts]);

  // Aplica filtros de categoria, favoritos e ordenação no cliente sem perder reatividade
  const displayedProducts = useMemo(() => {
    let list = [...rawProducts];

    if (selectedCategory !== 'ALL') {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (onlyFavorites) {
      list = list.filter((p) => favorites.includes(p.id));
    }

    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'RATING_DESC') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [rawProducts, selectedCategory, onlyFavorites, favorites, sortBy]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const next = exists
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      showToast(
        exists ? 'Removido da sua lista de desejos' : 'Salvo na lista de desejos ♥',
      );
      return next;
    });
  };

  const handleAddPhysicalProduct = async (product: Product, quantity = 1) => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity,
      });
      showToast(`${quantity}x "${product.name}" adicionado à sacola!`);
    } catch (err: any) {
      showToast(err.message || 'Não foi possível adicionar o produto.');
    }
  };

  const handleConfirmBooking = async (
    product: Product,
    quantity: number,
    booking: BookingMetadata,
  ) => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity,
        booking,
      });
      setIsCartOpen(true);
      showToast(`Check-in de "${product.name}" agendado na sacola!`);
    } catch (err: any) {
      showToast(err.message || 'Erro ao adicionar reserva.');
    }
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    try {
      await updateCartItem.mutateAsync({
        itemId: item.itemId,
        quantity: Math.max(0, newQuantity),
      });
    } catch (err: any) {
      showToast(err.message || 'Erro ao atualizar quantidade.');
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    try {
      await updateCartItem.mutateAsync({
        itemId: item.itemId,
        quantity: 0,
      });
      showToast('Item removido da sacola.');
    } catch (err: any) {
      showToast(err.message || 'Erro ao remover item.');
    }
  };

  const handleClearCart = async () => {
    await clearCart.mutateAsync();
    showToast('Sacola esvaziada.');
  };

  const handleConfirmCheckout = async (values: CheckoutFormValues) => {
    setCheckoutError(null);
    try {
      const response = await checkout.mutateAsync(values);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setCompletedOrder(response);
    } catch (err: any) {
      setCheckoutError(
        err.message || 'Falha ao finalizar a compra. Verifique os dados.',
      );
    }
  };

  const totalItems = cart?.totalItems ?? 0;
  const totalAmount = cart?.totalAmount ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 pb-20 sm:pb-0">
      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2.5 bg-slate-950 text-white px-4 py-3.5 rounded-2xl shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            {toastMessage}
          </span>
        </div>
      )}

      {/* Top Announcement Bar (Faixa de Loja Real) */}
      <div className="bg-slate-950 text-slate-300 text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-1.5 font-medium truncate">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">
              <strong>Frete Grátis</strong> acima de R$ 299 • Cupom{' '}
              <strong className="text-white">BEMVINDO10</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-400 shrink-0">
            <span>10% OFF no PIX Instantâneo</span>
            <span>•</span>
            <span>Check-in Garantido em Bookings</span>
          </div>
        </div>
      </div>

      {/* Navbar Principal Fixa */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-6">
          {/* Logo Premium Customizado */}
          <div
            onClick={() => {
              setSelectedType('ALL');
              setSelectedCategory('ALL');
              setOnlyFavorites(false);
              setSearchInput('');
            }}
            className="cursor-pointer shrink-0"
          >
            <BrandLogo variant="dark" />
          </div>

          {/* Barra de Busca Central (Desktop/Tablet) */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="O que você procura hoje? (Ex: Fone Pro X, Cabana Alpina, Estúdio, Mentoria...)"
                className="w-full pl-11 pr-9 py-2.5 rounded-2xl bg-slate-100/90 hover:bg-slate-100 border border-transparent focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm text-slate-900 transition-all"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Ações Rápidas: Favoritos, Meus Pedidos e Sacola */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Botão Favoritos */}
            <button
              type="button"
              onClick={() => setOnlyFavorites((prev) => !prev)}
              title="Lista de Desejos"
              className={`relative p-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                onlyFavorites
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Heart
                className={`w-4 h-4 ${
                  onlyFavorites || favorites.length > 0
                    ? 'fill-rose-500 text-rose-500'
                    : ''
                }`}
              />
              <span className="hidden lg:inline">Desejos</span>
              {favorites.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-extrabold">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Botão Histórico de Pedidos (Banco de Dados) */}
            <button
              type="button"
              onClick={() => setIsOrdersHistoryOpen(true)}
              className="relative p-2 sm:px-3.5 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">Meus Pedidos</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-extrabold">
                  {orders.length}
                </span>
              )}
            </button>

            {/* Botão Principal da Sacola */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-950 hover:bg-indigo-600 text-white transition-all shadow-sm cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-4 h-4 sm:min-w-5 sm:h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] sm:text-[11px] font-black flex items-center justify-center shadow">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[10px] uppercase tracking-wider text-slate-400 block leading-none">
                  Sacola
                </span>
                <span className="text-sm font-extrabold leading-tight">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Barra de Busca Mobile (text-base evita auto-zoom no iOS/Android) */}
        <div className="px-3 pb-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar produtos ou reservas..."
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-100 border border-slate-200/80 text-base sm:text-xs focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Faixa Compacta de Benefícios da Loja (Oculta excesso no mobile) */}
      <section className="hidden sm:block bg-white border-b border-slate-200/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Envio Full & Voucher Digital
              </div>
              <div className="text-[11px] text-slate-500">
                Entrega rápida em todo país
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-50 text-violet-600 shrink-0">
              <RefreshCcw className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Check-in com Horário Marcado
              </div>
              <div className="text-[11px] text-slate-500">
                Reagendamento fácil até 24h
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Garantia Oficial 12 Meses
              </div>
              <div className="text-[11px] text-slate-500">
                Produtos 100% originais
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Confirmação por E-mail
              </div>
              <div className="text-[11px] text-slate-500">
                Recibo imediato no checkout
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conteúdo Principal do Catálogo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-8 space-y-3.5 sm:space-y-5">
        {/* Cabeçalho Direto do Catálogo + Abas + Ordenação */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-4">
          {/* Abas Principais */}
          <div className="flex overflow-x-auto no-scrollbar">
            <div className="inline-flex p-1 rounded-xl sm:rounded-2xl bg-slate-200/80 w-full sm:w-auto justify-between sm:justify-start">
              {[
                { id: 'ALL', label: 'Todos', fullLabel: 'Vitrine Completa', icon: Layers },
                { id: 'PHYSICAL', label: 'Físicos', fullLabel: 'Produtos Físicos', icon: Package },
                {
                  id: 'BOOKING',
                  label: 'Bookings',
                  fullLabel: 'Experiências & Booking',
                  icon: CalendarClock,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = selectedType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setSelectedType(tab.id as ProductType | 'ALL');
                      setSelectedCategory('ALL');
                    }}
                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[11px] sm:text-sm font-extrabold transition-all cursor-pointer ${
                      active
                        ? 'bg-white text-slate-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="sm:hidden">{tab.label}</span>
                    <span className="hidden sm:inline">{tab.fullLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seletor de Ordenação + Contador */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
              <strong className="text-slate-900">
                {displayedProducts.length}
              </strong>{' '}
              {displayedProducts.length === 1 ? 'item' : 'itens'}
            </span>

            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute left-2.5 sm:left-3 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="pl-7 sm:pl-8 pr-6 sm:pr-8 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white border border-slate-200 text-[11px] sm:text-xs font-bold text-slate-800 focus:border-indigo-600 focus:outline-none cursor-pointer"
              >
                <option value="FEATURED">Ordenar: Destaques</option>
                <option value="PRICE_ASC">Menor Preço</option>
                <option value="PRICE_DESC">Maior Preço</option>
                <option value="RATING_DESC">Melhor Avaliação (★)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pílulas de Categoria */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold shrink-0 border transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat === 'ALL' ? 'Todas' : cat}
              </button>
            );
          })}
        </div>

        {/* Grade Responsiva de Produtos (2 por linha no mobile, 3 no tablet/laptop, 4 no desktop) */}
        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[260px] sm:h-[440px] rounded-xl sm:rounded-3xl bg-slate-200/70 animate-pulse"
              />
            ))}
          </div>
        ) : isProductsError ? (
          <div className="p-8 rounded-3xl bg-rose-50 border border-rose-200 text-center space-y-2">
            <h3 className="text-base font-extrabold text-rose-900">
              Não foi possível carregar o catálogo da API
            </h3>
            <p className="text-sm text-rose-700">
              Verifique se o servidor Back-end NestJS está ativo em{' '}
              <code>http://localhost:3001</code>.
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <h3 className="text-base font-extrabold text-slate-800">
              Nenhum item encontrado para este filtro
            </h3>
            <p className="text-sm text-slate-500">
              Experimente limpar a busca ou mostrar todas as categorias.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedType('ALL');
                setSelectedCategory('ALL');
                setOnlyFavorites(false);
                setSearchInput('');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold cursor-pointer"
            >
              Limpar Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddPhysical={(prod) => handleAddPhysicalProduct(prod, 1)}
                onOpenBookingModal={(prod) => setBookingProduct(prod)}
                onOpenQuickView={(prod) => setQuickViewProduct(prod)}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={handleToggleFavorite}
                isAdding={addToCart.isPending}
              />
            ))}
          </div>
        )}
      </main>

      {/* Rodapé Completo Estilo Loja Oficial */}
      <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs">
          <div className="space-y-3">
            <BrandLogo variant="light" />
            <p className="text-slate-400 leading-relaxed">
              Plataforma Full Stack de E-commerce Híbrido (Produtos Físicos &
              Reservas com Check-in), construída com foco em performance,
              segurança e experiência do usuário.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold uppercase tracking-wider">
              Diferenciais Técnicos Aplicados
            </div>
            <ul className="space-y-1 text-slate-400">
              <li>• Front-end: Next.js 15, React 19, Tailwind CSS</li>
              <li>• Estado & Forms: TanStack Query, React Hook Form, Zod</li>
              <li>• Back-end: NestJS, TypeORM, Nodemailer + Swagger</li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold uppercase tracking-wider">
              Atalhos para o Avaliador
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOrdersHistoryOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold transition-colors cursor-pointer"
              >
                Ver Pedidos Salvos no Banco
              </button>
              <a
                href="http://localhost:3001/api-docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-semibold transition-colors"
              >
                Abrir Swagger API (:3001)
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Barra Fixa Inferior no Mobile (Sticky Mobile Cart Bar) */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-slate-950/95 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 text-white shadow-2xl">
          <div>
            <span className="text-[11px] text-slate-400 block">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'} na sacola
            </span>
            <span className="text-base font-black text-emerald-400">
              {formatCurrency(totalAmount)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Sacola / Finalizar</span>
          </button>
        </div>
      )}

      {/* Modal Quick View (Detalhes do Produto) */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddPhysicalWithQty={handleAddPhysicalProduct}
        onOpenBookingModal={(prod) => setBookingProduct(prod)}
        isAdding={addToCart.isPending}
      />

      {/* Modal de Seleção de Data e Horário para produtos de Booking */}
      <BookingModal
        product={bookingProduct}
        onClose={() => setBookingProduct(null)}
        onConfirmBooking={handleConfirmBooking}
        isSubmitting={addToCart.isPending}
      />

      {/* Gaveta Lateral da Sacola */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setCheckoutError(null);
          setIsCheckoutOpen(true);
        }}
        isUpdating={updateCartItem.isPending || clearCart.isPending}
      />

      {/* Modal de Finalização de Compra */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        onConfirmOrder={handleConfirmCheckout}
        isSubmitting={checkout.isPending}
        serverError={checkoutError}
      />

      {/* Modal de Pedido Concluído + Link do E-mail de Confirmação */}
      <OrderSuccessModal
        orderResponse={completedOrder}
        onClose={() => setCompletedOrder(null)}
      />

      {/* Modal de Histórico de Pedidos Salvos no Banco */}
      <OrdersHistoryModal
        isOpen={isOrdersHistoryOpen}
        onClose={() => setIsOrdersHistoryOpen(false)}
      />
    </div>
  );
}
