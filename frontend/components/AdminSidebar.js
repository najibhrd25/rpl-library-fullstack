'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  const adminLinks = [
    { 
      href: '/dashboard', 
      label: 'Ringkasan',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
    },
    { 
      href: '/dashboard/books', 
      label: 'Koleksi',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
    },
    { 
      href: '/dashboard/categories', 
      label: 'Kategori',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
    },
    { 
      href: '/dashboard/transactions', 
      label: 'Sirkulasi',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">RL</div>
        <span className="admin-brand">Workspace</span>
      </div>

      <div className="admin-sidebar-content">
        <div className="admin-nav-group">
          <div className="admin-nav-title">Menu Utama</div>
          <nav className="admin-nav-links">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`admin-nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="admin-sidebar-footer">
        <button onClick={logout} className="admin-nav-link text-error w-full text-left" style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '10px 14px' }}>
          <span className="icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </span>
          Keluar Sistem
        </button>
      </div>
    </aside>
  );
}
