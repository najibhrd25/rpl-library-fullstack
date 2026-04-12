'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { user, login, register, loading } = useAuth();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/catalog');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Login berhasil! Selamat datang 🎉');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Registrasi berhasil! Silakan login.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">📚</div>
            <h1 className="auth-title">{isLogin ? 'Selamat Datang!' : 'Buat Akun Baru'}</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Masuk ke akun RPLibrary Anda' : 'Daftar sebagai member perpustakaan'}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
                <label className="form-label" htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Masukkan nama lengkap"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="contoh@mail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={submitting}
              style={{ marginTop: '8px' }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></div>
                  {isLogin ? 'Memproses...' : 'Mendaftar...'}
                </span>
              ) : (
                isLogin ? '🔐 Masuk' : '📝 Daftar'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button onClick={() => {
              setIsLogin(!isLogin);
              setFormData({ name: '', email: '', password: '' });
            }}>
              {isLogin ? 'Daftar Sekarang' : 'Masuk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
