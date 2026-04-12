'use client';

import { useState, useEffect, useCallback } from 'react';
import ApiService from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import AppLayout from '@/components/AppLayout';
import Modal from '@/components/Modal';

export default function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowing, setBorrowing] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const fetchBooks = useCallback(async () => {
    try {
      const params = {};
      if (search) params.title = search;
      if (categoryFilter) params.categoryId = categoryFilter;
      const data = await ApiService.getBooks(params);
      setBooks(data.data.books);
    } catch (err) {
      toast.error('Gagal memuat buku');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await ApiService.getCategories();
      setCategories(data.data.categories);
    } catch (err) {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setLoading(true);
    const debounce = setTimeout(() => {
      fetchBooks();
    }, 400);
    return () => clearTimeout(debounce);
  }, [search, categoryFilter, fetchBooks]);

  const handleBorrow = async (bookId) => {
    if (!user) {
      toast.warning('Silakan login terlebih dahulu untuk meminjam buku');
      return;
    }
    if (user.role === 'ADMIN') {
      toast.info('Admin tidak bisa meminjam buku. Gunakan akun MEMBER.');
      return;
    }
    setBorrowing(true);
    try {
      await ApiService.borrowBook(bookId);
      toast.success('Berhasil meminjam buku! 📖');
      setSelectedBook(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.message || 'Gagal meminjam buku');
    } finally {
      setBorrowing(false);
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <h1 className="page-title">📚 Katalog Buku</h1>
        <p className="page-subtitle">Jelajahi koleksi perpustakaan RPL</p>
      </div>

      <div className="catalog-controls">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Cari judul buku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="books-grid stagger-children">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="book-card">
              <div className="skeleton" style={{ height: '200px' }}></div>
              <div style={{ padding: '16px' }}>
                <div className="skeleton" style={{ height: '12px', width: '60%', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '16px', width: '80%', marginBottom: '6px' }}></div>
                <div className="skeleton" style={{ height: '12px', width: '50%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-title">Belum ada buku</div>
          <div className="empty-description">
            {search || categoryFilter
              ? 'Tidak ditemukan buku yang sesuai dengan filter Anda.'
              : 'Koleksi buku masih kosong. Tunggu admin menambahkan buku baru!'}
          </div>
        </div>
      ) : (
        <div className="books-grid stagger-children">
          {books.map((book) => (
            <div
              key={book.id}
              className="book-card"
              onClick={() => setSelectedBook(book)}
            >
              <div className="book-cover">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} />
                ) : (
                  <span className="no-cover">📖</span>
                )}
                <span className={`book-stock-badge ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {book.stock > 0 ? `Stok: ${book.stock}` : 'Habis'}
                </span>
              </div>
              <div className="book-info">
                {book.category && (
                  <span className="book-category-tag">{book.category.name}</span>
                )}
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">oleh {book.author}</p>
                <div className="book-footer">
                  <span className="book-stock-text">{book.stock} tersedia</span>
                  {user && user.role === 'MEMBER' && book.stock > 0 && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBorrow(book.id);
                      }}
                    >
                      Pinjam
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Detail Modal */}
      <Modal
        isOpen={!!selectedBook}
        onClose={() => setSelectedBook(null)}
        title={selectedBook?.title || ''}
        footer={
          user && user.role === 'MEMBER' && selectedBook?.stock > 0 ? (
            <>
              <button className="btn btn-secondary" onClick={() => setSelectedBook(null)}>Tutup</button>
              <button
                className="btn btn-primary"
                onClick={() => handleBorrow(selectedBook.id)}
                disabled={borrowing}
              >
                {borrowing ? 'Memproses...' : '📖 Pinjam Buku Ini'}
              </button>
            </>
          ) : (
            <button className="btn btn-secondary" onClick={() => setSelectedBook(null)}>Tutup</button>
          )
        }
      >
        {selectedBook && (
          <div>
            {selectedBook.coverImage && (
              <div style={{
                width: '100%',
                height: '240px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '20px',
                background: 'var(--bg-tertiary)',
              }}>
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {selectedBook.category && (
                <span className="book-category-tag">{selectedBook.category.name}</span>
              )}
              <span className={`book-stock-badge ${selectedBook.stock > 0 ? 'in-stock' : 'out-of-stock'}`}
                style={{ position: 'static' }}>
                {selectedBook.stock > 0 ? `Stok: ${selectedBook.stock}` : 'Stok Habis'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Penulis:</strong> {selectedBook.author}
            </p>
            {selectedBook.description && (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {selectedBook.description}
              </p>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
