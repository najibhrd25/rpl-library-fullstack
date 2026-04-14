'use client';

import { useAuth } from '@/lib/AuthContext';
import StudentNavbar from './StudentNavbar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function StudentLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

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
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="skeleton" style={{ width: '120px', height: '2px' }}></div>
      </div>
    );
  }

  return (
    <div className="student-layout">
      <StudentNavbar />
      <main className="student-main-content">
        <div className="student-page-container">
          {children}
        </div>
      </main>
    </div>
  );
}
