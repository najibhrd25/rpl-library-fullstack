'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/Modal';

export default function TransactionsManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/catalog');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const data = await ApiService.getTransactions();
      setTransactions(data.data.transactions);
    } catch (err) {
      toast.error('Gagal memuat transaksi');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedTransaction) return;
    setSubmitting(true);
    try {
      await ApiService.returnBook(selectedTransaction.id);
      toast.success('Pengembalian buku berhasil dikonfirmasi! ✅');
      setReturnModalOpen(false);
      setSelectedTransaction(null);
      fetchTransactions();
    } catch (err) {
      toast.error(err.message || 'Gagal mengonfirmasi pengembalian');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status === filter;
  });

  if (authLoading || !user) {
    return <AppLayout><div className="loading-page"><div className="loading-spinner"></div></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">🔄 Kelola Transaksi</h1>
        <p className="page-subtitle">Lihat semua peminjaman dan konfirmasi pengembalian buku</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { value: 'ALL', label: 'Semua', icon: '📋' },
          { value: 'BORROWED', label: 'Dipinjam', icon: '📖' },
          { value: 'RETURNED', label: 'Dikembalikan', icon: '✅' },
        ].map((tab) => (
          <button
            key={tab.value}
            className={`btn ${filter === tab.value ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.icon} {tab.label}
            {tab.value !== 'ALL' && (
              <span style={{
                marginLeft: '6px',
                background: filter === tab.value ? 'rgba(255,255,255,0.2)' : 'var(--bg-glass)',
                padding: '1px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.7rem',
              }}>
                {transactions.filter((t) => t.status === tab.value).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner"></div><div className="loading-text">Memuat transaksi...</div></div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">Tidak ada transaksi</div>
          <div className="empty-description">
            {filter !== 'ALL'
              ? 'Tidak ada transaksi dengan status tersebut.'
              : 'Belum ada transaksi peminjaman buku.'}
          </div>
        </div>
      ) : (
        <div className="table-wrapper animate-fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Peminjam</th>
                <th>Email</th>
                <th>Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#{t.id}</td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.user?.name || '-'}</td>
                  <td style={{ fontSize: '0.8rem' }}>{t.user?.email || '-'}</td>
                  <td>{t.book?.title || '-'}</td>
                  <td>
                    {new Date(t.borrowDate).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </td>
                  <td>
                    {t.returnDate
                      ? new Date(t.returnDate).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>
                    }
                  </td>
                  <td>
                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {t.status === 'BORROWED' ? 'Dipinjam' : 'Dikembalikan'}
                    </span>
                  </td>
                  <td>
                    {t.status === 'BORROWED' ? (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => {
                          setSelectedTransaction(t);
                          setReturnModalOpen(true);
                        }}
                      >
                        ✅ Konfirmasi Return
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="✅ Konfirmasi Pengembalian"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setReturnModalOpen(false)}>Batal</button>
            <button className="btn btn-success" onClick={handleReturn} disabled={submitting}>
              {submitting ? 'Memproses...' : '✅ Konfirmasi Pengembalian'}
            </button>
          </>
        }
      >
        <p className="confirm-text">
          Konfirmasi pengembalian buku berikut:
        </p>
        {selectedTransaction && (
          <div className="card" style={{ marginTop: '16px', background: 'var(--bg-glass)' }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Peminjam</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTransaction.user?.name}</div>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Buku</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedTransaction.book?.title}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Dipinjam pada</span>
              <div style={{ color: 'var(--text-secondary)' }}>
                {new Date(selectedTransaction.borrowDate).toLocaleDateString('id-ID', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })}
              </div>
            </div>
          </div>
        )}
        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Stok buku akan otomatis bertambah 1 setelah dikonfirmasi.
        </p>
      </Modal>
    </AppLayout>
  );
}
