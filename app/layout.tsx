import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { DarkModeToggle } from "@/components/dark-mode-toggle";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema de Gestión de Inventario',
  description: 'Sistema de gestión de pedidos entre puntos de venta y bodega',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <DarkModeToggle />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}