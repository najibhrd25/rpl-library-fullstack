'use client';

import { useAuth } from '@/lib/AuthContext';
import StudentNavbar from './StudentNavbar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function StudentLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'MEMBER') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'MEMBER') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FBF9F6]">
        <div className="skeleton" style={{ width: '120px', height: '2px', background: '#8C5F35' }}></div>
      </div>
    );
  }

  return (
    <div className="student-layout">
      {mobileMenuOpen && (
        <div 
          className="admin-sidebar-overlay" 
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 95 }}
        ></div>
      )}
      <StudentNavbar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />
      <main className="student-main-content">
        <div className="student-page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
