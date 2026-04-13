'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import AppLayout from '@/components/AppLayout';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    books: 0,
    categories: 0,
    transactions: 0,
    activeBorrows: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/catalog');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [booksRes, categoriesRes, transactionsRes] = await Promise.all([
        ApiService.getBooks(),
        ApiService.getCategories(),
        ApiService.getTransactions(),
      ]);

      const transactions = transactionsRes.data.transactions;
      const activeBorrows = transactions.filter((t) => t.status === 'BORROWED').length;

      setStats({
        books: booksRes.data.books.length,
        categories: categoriesRes.data.categories.length,
        transactions: transactions.length,
        activeBorrows,
      });

      setRecentTransactions(transactions.slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="loading-page">
          <div className="loading-spinner"></div>
          <div className="loading-text">Menyiapkan Dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Ringkasan Sistem</h1>
        <p className="page-subtitle">Selamat datang kembali, {user.name}. Berikut adalah statistik perpustakaan saat ini.</p>
      </div>

      {loadingStats ? (
        <div className="stats-grid stagger-children">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }}></div>
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: '28px', width: '60px', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '100px' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="stats-grid stagger-children">
          <div className="stat-card">
            <div className="stat-icon books">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.books}</div>
              <div className="stat-label">Koleksi Buku</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon categories">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.categories}</div>
              <div className="stat-label">Kategori Aktif</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon transactions">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeBorrows}</div>
              <div className="stat-label">Buku Dipinjam</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon users">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.transactions}</div>
              <div className="stat-label">Total Riwayat</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="table-wrapper animate-fade-in" style={{ animationDelay: '0.2s', marginTop: '32px' }}>
        <div className="table-header">
          <h3 className="table-title">Aktivitas Terbaru</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push('/dashboard/transactions')}
          >
            Semua Transaksi
          </button>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '64px' }}>
            <div className="empty-title">Belum Ada Aktivitas</div>
            <p className="empty-description">Aktivitas peminjaman dan pengembalian akan muncul secara real-time di sini.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Peminjam</th>
                  <th>Judul Buku</th>
                  <th>Tanggal Pinjam</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{t.user?.name || '-'}</td>
                    <td>{t.book?.title || '-'}</td>
                    <td>{new Date(t.borrowDate).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}</td>
                    <td>
                      <span className={`status-badge ${t.status.toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {t.status === 'BORROWED' ? 'Terpinjam' : 'Kembali'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

