'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Menu, X, BookOpen, Clock, User, LogOut } from 'lucide-react';

export default function StudentNavbar({ mobileOpen, setMobileOpen }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <nav className="student-navbar" style={{ background: 'var(--bg-glass-strong)', backdropFilter: 'var(--bg-glass-blur)' }}>
      <div className="student-navbar-inner">
        <div className="student-nav-left">
          <button 
            className="md:hidden text-gray-700 mr-3" 
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: 'none' }}
            id="student-hamburger"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link href="/catalog" className="student-brand flex items-center" style={{ marginRight: '32px' }}>
            <div style={{background: 'var(--primary-gradient)', color: '#fff', borderRadius: '6px', padding: '4px 10px', fontWeight: 'bold', fontSize: '1.2rem'}}>SE</div>
          </Link>
          <div className="student-nav-links hidden md:flex">
            <Link 
              href="/catalog" 
              className={`student-nav-link flex items-center gap-2 ${isActive('/catalog') ? 'active' : ''}`}
            >
              <BookOpen size={16} /> Eksplorasi
            </Link>
            <Link 
              href="/my-borrowings" 
              className={`student-nav-link flex items-center gap-2 ${isActive('/my-borrowings') ? 'active' : ''}`}
            >
              <Clock size={16} /> Peminjaman Saya
            </Link>
          </div>
        </div>

        <div className="student-nav-right hidden md:flex">
          <Link href="/profile" className="student-user-pill flex items-center gap-2" style={{textDecoration: 'none'}}>
            <span className="student-user-name text-gray-800">{user?.name}</span>
            <div className="student-user-avatar" style={{background: 'var(--primary-gradient)'}}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </Link>
          <button onClick={logout} className="student-logout-btn flex items-center gap-2 cursor-pointer transition-colors shadow-sm" style={{ padding: '8px 16px', backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: 600, justifyContent: 'center' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#DC2626'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#EF4444'}
          >
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </div>
      
      {/* Mobile Slide-down Menu */}
      {mobileOpen && (
        <div className="md:hidden mobile-dropdown p-4 border-t" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
          <div className="flex flex-col gap-4">
            <Link 
              href="/catalog" 
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-md ${isActive('/catalog') ? 'bg-orange-50 text-orange-600' : 'text-gray-600'}`}
            >
              <BookOpen size={18} /> Eksplorasi
            </Link>
            <Link 
              href="/my-borrowings" 
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-md ${isActive('/my-borrowings') ? 'bg-orange-50 text-orange-600' : 'text-gray-600'}`}
            >
              <Clock size={18} /> Peminjaman Saya
            </Link>
            <hr style={{borderColor: 'var(--border)'}} />
            <Link 
              href="/profile" 
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 p-2 rounded-md ${isActive('/profile') ? 'bg-orange-50 text-orange-600' : 'text-gray-600'}`}
            >
              <User size={18} /> Profil Mahasiswa
            </Link>
            <button 
              onClick={() => { logout(); setMobileOpen(false); }}
              className="flex items-center justify-center gap-3 p-3 mt-2 rounded-md cursor-pointer"
              style={{ backgroundColor: '#EF4444', color: '#FFFFFF', border: 'none', fontWeight: 600, justifyContent: 'center' }}
            >
              <LogOut size={18} /> Keluar Sistem
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 768px) {
          #student-hamburger { display: block !important; }
          .student-nav-links, .student-nav-right { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
