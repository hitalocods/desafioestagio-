import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'NovaStore | E-commerce & Booking Full Stack',
  description:
    'Loja virtual híbrida com produtos físicos e reservas com agendamento de data e horário (Booking), construída com Next.js, TanStack Query, React Hook Form, Zod, Tailwind CSS, NestJS e TypeORM.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
