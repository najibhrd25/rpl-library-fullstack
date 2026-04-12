'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
        <div className="loading-text">Memuat RPLibrary...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      {user && <Sidebar isOpen={sidebarOpen} />}
      <main className={`main-content ${user ? 'with-sidebar' : ''}`}>
        <div className="page-content">
          {children}
        </div>
      </main>
    </>
  );
}
