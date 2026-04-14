'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import AdminLayout from '@/components/AdminLayout';
import Modal from '@/components/Modal';

export default function BooksManagementPage() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '', author: '', description: '', stock: '', categoryId: '',
  });
  const [coverFile, setCoverFile] = useState(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/catalog');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      fetchBooks();
      fetchCategories();
    }
  }, [user]);

  const fetchBooks = async () => {
    try {
      const data = await ApiService.getBooks();
      setBooks(data.data.books);
    } catch (err) {
      toast.error('Gagal memuat daftar buku');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data.data.categories);
    } catch (err) { /* ignore */ }
  };

  const openCreateModal = () => {
    setEditingBook(null);
    setFormData({ title: '', author: '', description: '', stock: '', categoryId: '' });
    setCoverFile(null);
    setCoverPreview(null);
    setModalOpen(true);
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      stock: book.stock?.toString() || '',
      categoryId: book.categoryId?.toString() || '',
    });
    setCoverFile(null);
    setCoverPreview(book.coverImage || null);
    setModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', formData.title);
      fd.append('author', formData.author);
      if (formData.description) fd.append('description', formData.description);
      fd.append('stock', formData.stock);
      fd.append('categoryId', formData.categoryId);
      if (coverFile) fd.append('coverImage', coverFile);

      if (editingBook) {
        await ApiService.updateBook(editingBook.id, fd);
        toast.success('Buku berhasil diperbarui! ✏️');
      } else {
        await ApiService.createBook(fd);
        toast.success('Buku berhasil ditambahkan! 📖');
      }
      setModalOpen(false);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan buku');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBook) return;
    setSubmitting(true);
    try {
      await ApiService.deleteBook(deletingBook.id);
      toast.success('Buku berhasil dihapus');
      setDeleteModalOpen(false);
      setDeletingBook(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus buku');
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
          <h1 className="page-title">Inventaris Buku</h1>
          <p className="page-subtitle">Tambah, edit, atau hapus koleksi buku perpustakaan</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Tambah Buku
        </button>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner"></div><div className="loading-text">Memuat buku...</div></div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">Belum ada buku</div>
          <div className="empty-description">Mulai tambahkan buku pertama ke perpustakaan.</div>
          <button className="btn btn-primary" onClick={openCreateModal}>+ Tambah Buku Pertama</button>
        </div>
      ) : (
        <div className="table-wrapper animate-fade-in">
          <table className="data-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Judul</th>
                <th>Penulis</th>
                <th>Kategori</th>
                <th>Stok</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div style={{
                      width: '44px', height: '56px', borderRadius: '6px', overflow: 'hidden',
                      background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.2rem', opacity: 0.3 }}>📖</span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{book.title}</td>
                  <td>{book.author}</td>
                  <td>
                    {book.category ? (
                      <span className="book-category-tag">{book.category.name}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge ${book.stock > 0 ? 'returned' : 'borrowed'}`}>
                      {book.stock}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-icon" title="Edit" onClick={() => openEditModal(book)}>✏️</button>
                      <button className="btn-icon" title="Hapus" style={{ color: 'var(--error)' }}
                        onClick={() => {
                          setDeletingBook(book);
                          setDeleteModalOpen(true);
                        }}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBook ? '✏️ Edit Buku' : '📖 Tambah Buku Baru'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Buku *</label>
            <input
              type="text" className="form-input" placeholder="Masukkan judul buku"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Penulis *</label>
            <input
              type="text" className="form-input" placeholder="Masukkan nama penulis"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-textarea" placeholder="Deskripsi buku (opsional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Stok *</label>
              <input
                type="number" className="form-input" placeholder="0" min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Kategori *</label>
              <select
                className="form-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                required
              >
                <option value="">Pilih Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Cover Image</label>
            <div
              className="form-file-upload"
              onClick={() => fileInputRef.current?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} alt="Preview"
                  style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
              ) : (
                <>
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    Klik untuk <strong>upload gambar cover</strong>
                    <br />
                    <span style={{ fontSize: '0.75rem' }}>PNG, JPG, JPEG (max 5MB)</span>
                  </div>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
          <div className="modal-footer" style={{ border: 'none', paddingTop: '8px', margin: 0 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Menyimpan...' : (editingBook ? 'Simpan Perubahan' : 'Tambah Buku')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="🗑️ Hapus Buku"
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
          Apakah Anda yakin ingin menghapus buku <span className="confirm-highlight">&quot;{deletingBook?.title}&quot;</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
      </Modal>
    </AdminLayout>
  );
}
