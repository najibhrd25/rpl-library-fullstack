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
        toast.success('Selamat datang kembali!');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Akun berhasil dibuat. Silakan masuk.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      console.error('[Login Error]', err);
      toast.error(err.message || 'Gagal masuk. Silakan periksa kredensial Anda.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card animate-fade-in">
          <div className="auth-header">
            <div className="auth-logo">
              <span style={{ color: 'white', fontWeight: '800' }}>RL</span>
            </div>
            <h1 className="auth-title">{isLogin ? 'Selamat Datang' : 'Daftar Akun'}</h1>
            <p className="auth-subtitle">
              {isLogin ? 'Masuk ke portal RPLibrary' : 'Mulai perjalanan literasi Anda'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="stagger-children">
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Masukkan nama Anda"
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
                placeholder="nama@email.com"
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
                placeholder="Min. 6 karakter"
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
              style={{ marginTop: '12px' }}
            >
              {submitting ? (
                <span className="flex items-center gap-sm">
                  <div className="loading-spinner" style={{ width: '18px', height: '18px', borderWidth: '2px', borderTopColor: 'white' }}></div>
                  Memproses...
                </span>
              ) : (
                isLogin ? 'Masuk Sekarang' : 'Daftar Akun'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span>{isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}</span>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {isLogin ? 'Buat Akun' : 'Masuk'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

