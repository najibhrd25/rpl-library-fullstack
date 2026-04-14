'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import StudentLayout from '@/components/StudentLayout';

export default function MyBorrowingsPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const data = await ApiService.getTransactions();
      setTransactions(data.data.transactions);
    } catch (err) {
      toast.error('Gagal memuat riwayat peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  if (authLoading || !user) {
    return <StudentLayout><div className="loading-page"><div className="loading-spinner"></div></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <div className="page-header">
        <h1 className="page-title">Riwayat Peminjaman</h1>
        <p className="page-subtitle">Riwayat peminjaman buku Anda di perpustakaan RPL</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { value: 'ALL', label: 'Semua', icon: '📋' },
          { value: 'BORROWED', label: 'Sedang Dipinjam', icon: '📖' },
          { value: 'RETURNED', label: 'Sudah Dikembalikan', icon: '✅' },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner"></div><div className="loading-text">Memuat riwayat...</div></div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">
            {filter === 'ALL' ? 'Belum ada peminjaman' : 'Tidak ada data'}
          </div>
          <div className="empty-description">
            {filter === 'ALL'
              ? 'Anda belum meminjam buku. Kunjungi katalog untuk meminjam buku!'
              : 'Tidak ada peminjaman dengan status tersebut.'}
          </div>
          {filter === 'ALL' && (
            <button className="btn btn-primary" onClick={() => router.push('/catalog')}>
              📚 Lihat Katalog
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="stagger-children">
          {filteredTransactions.map((t) => (
            <div key={t.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: 'var(--radius-md)',
                background: t.status === 'BORROWED' ? 'var(--warning-bg)' : 'var(--success-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', flexShrink: 0,
              }}>
                {t.status === 'BORROWED' ? '📖' : '✅'}
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  {t.book?.title || 'Buku tidak ditemukan'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  oleh {t.book?.author || '-'}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <span className={`status-badge ${t.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {t.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
                </span>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {new Date(t.borrowDate).toLocaleDateString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {t.returnDate && (
                    <> → {new Date(t.returnDate).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}</>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
