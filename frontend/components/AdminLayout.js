'use client';

import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from './AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, X, User } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'ADMIN') {
        router.push('/catalog');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F6]">
        <div className="skeleton" style={{ width: '120px', height: '2px', background: '#8C5F35' }}></div>
      </div>
    );
  }

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="admin-layout">
      {mobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 85 }}
        ></div>
      )}
      <AdminSidebar mobileOpen={mobileMenuOpen} closeMobile={() => setMobileMenuOpen(false)} />
      <main className="admin-main-content">
        <div className="admin-topbar">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden btn-icon p-2" 
              onClick={toggleMobileMenu}
              style={{ display: 'none' }}
              id="hamburger-btn"
            >
              <Menu size={20} />
            </button>
            <div className="admin-topbar-breadcrumb">
              Sistem Manajemen / <span style={{color: 'var(--primary)'}}>{user.name}</span>
            </div>
          </div>
          <div className="admin-topbar-profile flex items-center gap-2 text-gray-700">
            <User size={20} strokeWidth={1.5} />
            <span className="text-sm font-medium">{user.role === 'ADMIN' ? 'Admin' : user.name}</span>
          </div>
        </div>
        <div className="admin-page-container">
          {children}
        </div>
      </main>
      <style jsx>{`
        @media (max-width: 768px) {
          #hamburger-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
