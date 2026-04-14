'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';

export default function CategoriesManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/catalog');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchCategories();
    }
  }, [user]);

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data.data.categories);
    } catch (err) {
      toast.error('Gagal memuat kategori');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return;
    setSubmitting(true);
    try {
      if (editingCategory) {
        await ApiService.updateCategory(editingCategory.id, categoryName.trim());
        toast.success('Kategori berhasil diperbarui! ✏️');
      } else {
        await ApiService.createCategory(categoryName.trim());
        toast.success('Kategori berhasil dibuat! 🏷️');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan kategori');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setSubmitting(true);
    try {
      await ApiService.deleteCategory(deletingCategory.id);
      toast.success('Kategori berhasil dihapus');
      setDeleteModalOpen(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus kategori');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return <AdminLayout><div className="loading-page"><div className="loading-spinner"></div></div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Manajemen Kategori</h1>
          <p className="page-subtitle">Atur kategori untuk mengorganisir koleksi buku</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Tambah Kategori
        </button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner"></div><div className="loading-text">Memuat kategori...</div></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏷️</div>
          <div className="empty-title">Belum ada kategori</div>
          <div className="empty-description">Buat kategori pertama untuk mengorganisir buku.</div>
          <button className="btn btn-primary" onClick={openCreateModal}>+ Buat Kategori Pertama</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}
          className="stagger-children">
          {categories.map((cat) => (
            <div key={cat.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  🏷️ {cat.name}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {cat._count?.books || 0} buku
                </div>
              </div>
              <div className="table-actions">
                <button className="btn-icon" title="Edit" onClick={() => openEditModal(cat)}>✏️</button>
                <button className="btn-icon" title="Hapus" style={{ color: 'var(--error)' }}
                  onClick={() => {
                    setDeletingCategory(cat);
                    setDeleteModalOpen(true);
                  }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? '✏️ Edit Kategori' : '🏷️ Tambah Kategori Baru'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Kategori *</label>
            <input
              type="text" className="form-input" placeholder="Contoh: Programming, Science, Novel..."
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-footer" style={{ border: 'none', paddingTop: '8px', margin: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : (editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="🗑️ Hapus Kategori"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setDeleteModalOpen(false)}>Batal</button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={submitting}>
              {submitting ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </>
        }
      >
        <p className="confirm-text">
          Apakah Anda yakin ingin menghapus kategori <span className="confirm-highlight">&quot;{deletingCategory?.name}&quot;</span>?
          {deletingCategory?._count?.books > 0 && (
            <span style={{ display: 'block', marginTop: '8px', color: 'var(--warning)' }}>
              ⚠️ Kategori ini memiliki {deletingCategory._count.books} buku terkait dan tidak bisa dihapus.
            </span>
          )}
        </p>
      </Modal>
    </AdminLayout>
  );
}
