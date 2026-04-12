import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { ToastProvider } from '@/lib/ToastContext';

export const metadata = {
  title: 'RPLibrary — Sistem Manajemen Perpustakaan',
  description: 'Sistem manajemen perpustakaan digital untuk Lab RPL ITS. Kelola koleksi buku, peminjaman, dan pengembalian dengan mudah.',
  keywords: 'perpustakaan, RPL, ITS, buku, peminjaman',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
