'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Sidebar({ isOpen }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path) => pathname === path;

  const adminLinks = [
    { href: '/dashboard', icon: '📊', label: 'Dashboard' },
    { href: '/dashboard/books', icon: '📖', label: 'Kelola Buku' },
    { href: '/dashboard/categories', icon: '🏷️', label: 'Kategori' },
    { href: '/dashboard/transactions', icon: '🔄', label: 'Transaksi' },
  ];

  const generalLinks = [
    { href: '/catalog', icon: '📚', label: 'Katalog Buku' },
    { href: '/profile', icon: '👤', label: 'Profil Saya' },
  ];

  const memberLinks = [
    { href: '/my-borrowings', icon: '📋', label: 'Peminjaman Saya' },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {user?.role === 'ADMIN' && (
        <>
          <div className="sidebar-section-title">Admin Panel</div>
          <nav className="sidebar-nav">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </>
      )}

      <div className="sidebar-section-title">Umum</div>
      <nav className="sidebar-nav">
        {generalLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
        {user?.role === 'MEMBER' && memberLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${isActive(link.href) ? 'active' : ''}`}
          >
            <span className="icon">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
