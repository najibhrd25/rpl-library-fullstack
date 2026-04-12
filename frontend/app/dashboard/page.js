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
          <div className="loading-text">Memuat dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">📊 Dashboard Admin</h1>
        <p className="page-subtitle">Selamat datang kembali, {user.name}! Berikut ringkasan perpustakaan Anda.</p>
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
            <div className="stat-icon books">📖</div>
            <div className="stat-info">
              <div className="stat-value">{stats.books}</div>
              <div className="stat-label">Total Buku</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon categories">🏷️</div>
            <div className="stat-info">
              <div className="stat-value">{stats.categories}</div>
              <div className="stat-label">Kategori</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon transactions">🔄</div>
            <div className="stat-info">
              <div className="stat-value">{stats.activeBorrows}</div>
              <div className="stat-label">Sedang Dipinjam</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon users">📋</div>
            <div className="stat-info">
              <div className="stat-value">{stats.transactions}</div>
              <div className="stat-label">Total Transaksi</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="table-wrapper" style={{ animation: 'fadeInUp 0.6s ease forwards' }}>
        <div className="table-header">
          <h3 className="table-title">📋 Transaksi Terbaru</h3>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => router.push('/dashboard/transactions')}
          >
            Lihat Semua →
          </button>
        </div>
        {recentTransactions.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>
            <div className="empty-icon">📋</div>
            <div className="empty-title">Belum ada transaksi</div>
            <div className="empty-description">Transaksi peminjaman buku akan muncul di sini.</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Peminjam</th>
                <th>Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t) => (
                <tr key={t.id}>
                  <td>#{t.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.user?.name || '-'}</td>
                  <td>{t.book?.title || '-'}</td>
                  <td>{new Date(t.borrowDate).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}</td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {t.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
