'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, BookCopy, Tags, ArrowRightLeft, LogOut, X } from 'lucide-react';

export default function AdminSidebar({ mobileOpen, closeMobile }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  const adminLinks = [
    { 
      href: '/dashboard', 
      label: 'Ringkasan',
      icon: <LayoutDashboard size={18} strokeWidth={1.5} />
    },
    { 
      href: '/dashboard/books', 
      label: 'Koleksi',
      icon: <BookCopy size={18} strokeWidth={1.5} />
    },
    { 
      href: '/dashboard/categories', 
      label: 'Kategori',
      icon: <Tags size={18} strokeWidth={1.5} />
    },
    { 
      href: '/dashboard/transactions', 
      label: 'Sirkulasi',
      icon: <ArrowRightLeft size={18} strokeWidth={1.5} />
    },
  ];

  return (
    <aside className={`admin-sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="admin-sidebar-header flex justify-between items-center w-full">
        <div className="flex items-center" style={{ gap: '12px' }}>
          <div className="admin-logo" style={{background: 'var(--primary-gradient)', color: '#fff', borderRadius: '8px', padding: '4px 8px', fontWeight: 'bold'}}>SE</div>
          <span className="admin-brand font-semibold text-[1.05rem]" style={{color: 'var(--primary-dark)'}}>Lab Workspace</span>
        </div>
        <button className="md:hidden text-gray-500" onClick={closeMobile} id="close-btn" style={{ display: 'none' }}>
           <X size={20} />
        </button>
      </div>

      <div className="admin-sidebar-content">
        <div className="admin-nav-group">
          <div className="admin-nav-title">Menu Utama</div>
          <nav className="admin-nav-links">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => { if (window.innerWidth <= 768) closeMobile(); }}
                className={`admin-nav-link ${isActive(link.href) ? 'active' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="admin-sidebar-footer" style={{ padding: '0 24px 24px' }}>
        <button 
          onClick={logout} 
          className="w-full flex items-center gap-2 rounded-xl transition-all cursor-pointer shadow-sm" 
          style={{ padding: '12px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', fontWeight: 600, justifyContent: 'center', textAlign: 'center' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <LogOut size={18} strokeWidth={2.5} />
          <span>Keluar Sistem</span>
        </button>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          #close-btn { display: block !important; }
        }
      `}</style>
    </aside>
  );
}
