'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function StudentNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <nav className="student-navbar">
      <div className="student-navbar-inner">
        <div className="student-nav-left">
          <Link href="/catalog" className="student-brand">
            RL <span className="student-brand-text">Katalog</span>
          </Link>
          <div className="student-nav-links">
            <Link 
              href="/catalog" 
              className={`student-nav-link ${isActive('/catalog') ? 'active' : ''}`}
            >
              Eksplorasi
            </Link>
            <Link 
              href="/my-borrowings" 
              className={`student-nav-link ${isActive('/my-borrowings') ? 'active' : ''}`}
            >
              Peminjaman Saya
            </Link>
          </div>
        </div>

        <div className="student-nav-right">
          <div className="student-user-pill">
            <span className="student-user-name">{user?.name}</span>
            <div className="student-user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <button onClick={logout} className="student-logout-btn">
            Keluar
          </button>
        </div>
      </div>
    </nav>
  );
}
