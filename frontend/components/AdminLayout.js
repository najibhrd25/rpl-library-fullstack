'use client';

import { useAuth } from '@/lib/AuthContext';
import AdminSidebar from './AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="skeleton" style={{ width: '120px', height: '2px' }}></div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main-content">
        <div className="admin-topbar">
          <div className="admin-topbar-breadcrumb">
            Sistem Manajemen / {user.name}
          </div>
          <div className="admin-topbar-profile">
            <div className="admin-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="admin-role-badge">Admin</div>
          </div>
        </div>
        <div className="admin-page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
