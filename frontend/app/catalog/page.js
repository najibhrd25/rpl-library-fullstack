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
      toast.error('Gagal memuat daftar buku');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, toast]);

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
      toast.warning('Silakan masuk terlebih dahulu untuk meminjam buku');
      return;
    }
    if (user.role === 'ADMIN') {
      toast.info('Admin tidak diperbolehkan meminjam buku. Gunakan akun Member.');
      return;
    }
    setBorrowing(true);
    try {
      await ApiService.borrowBook(bookId);
      toast.success('Peminjaman berhasil diproses. Selamat membaca!');
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
      <div className="page-header animate-fade-in">
        <h1 className="page-title">Eksplorasi Katalog</h1>
        <p className="page-subtitle">Temukan koleksi literasi pilihan untuk pengembangan diri Anda</p>
      </div>

      <div className="catalog-controls animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="search-wrapper">
          <div className="search-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input
            type="text"
            className="search-input"
            placeholder="Ketik judul buku yang ingin dicari..."
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
        <div className="books-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="book-card">
              <div className="skeleton" style={{ height: '220px' }}></div>
              <div style={{ padding: '20px' }}>
                <div className="skeleton" style={{ height: '10px', width: '30%', marginBottom: '12px' }}></div>
                <div className="skeleton" style={{ height: '18px', width: '85%', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '12px', width: '50%' }}></div>
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="empty-state animate-fade-in">
          <div className="empty-title">Katalog Belum Tersedia</div>
          <p className="empty-description">
            {search || categoryFilter
              ? 'Tidak ada buku yang sesuai dengan pencarian atau filter Anda.'
              : 'Belum ada koleksi buku yang ditambahkan ke sistem ini.'}
          </p>
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
                  <div className="no-cover">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </div>
                )}
                <span className={`book-stock-badge ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {book.stock > 0 ? `Tersedia: ${book.stock}` : 'Stok Habis'}
                </span>
              </div>
              <div className="book-info">
                {book.category && (
                  <span className="book-category-tag">{book.category.name}</span>
                )}
                <h3 className="book-title">{book.title}</h3>
                <p className="book-author">Penulis: {book.author}</p>
                <div className="book-footer">
                  <span className="book-stock-text">{book.stock} Unit</span>
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
        title={selectedBook?.title || 'Detail Buku'}
        footer={
          <div className="flex gap-md">
            <button className="btn btn-secondary" onClick={() => setSelectedBook(null)}>Tutup</button>
            {user && user.role === 'MEMBER' && selectedBook?.stock > 0 && (
              <button
                className="btn btn-primary"
                onClick={() => handleBorrow(selectedBook.id)}
                disabled={borrowing}
              >
                {borrowing ? 'Sedang Memproses...' : 'Pinjam Buku'}
              </button>
            )}
          </div>
        }
      >
        {selectedBook && (
          <div className="animate-fade-in">
            {selectedBook.coverImage && (
              <div style={{
                width: '100%',
                height: '280px',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                marginBottom: '24px',
                background: 'var(--bg-tertiary)',
                boxShadow: 'var(--shadow-md)'
              }}>
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div className="flex gap-sm items-center mb-md">
              {selectedBook.category && (
                <span className="book-category-tag" style={{ marginBottom: 0 }}>{selectedBook.category.name}</span>
              )}
              <span className={`book-stock-badge ${selectedBook.stock > 0 ? 'in-stock' : 'out-of-stock'}`}
                style={{ position: 'static' }}>
                {selectedBook.stock > 0 ? `${selectedBook.stock} Tersedia` : 'Stok Habis'}
              </span>
            </div>
            
            <div className="mb-md">
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Informasi Penulis
              </h4>
              <p style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{selectedBook.author}</p>
            </div>

            {selectedBook.description && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sinopsis Buku
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {selectedBook.description}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}

