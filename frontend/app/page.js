'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';

export default function HomePage() {
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
        toast.success('Pintu akses terbuka.');
      } else {
        await register(formData.name, formData.email, formData.password);
        toast.success('Identitas terdaftar. Silakan masuk.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      toast.error(err.message || 'Kredensial tidak valid.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="skeleton" style={{ width: '120px', height: '2px' }}></div>
      </div>
    );
  }

  return (
    <div className="split-auth-container">
      {/* Left Side: Branding / Pattern */}
      <div className="auth-brand-side">
        <div className="brand-content animate-fade-in-up">
          <div className="brand-logo">RL</div>
          <h1 className="brand-heading">Membentuk <br/>Masa Depan Literasi.</h1>
          <p className="brand-subtext">
            Sistem sirkulasi pustaka cerdas rancangan tim ahli untuk mengoptimalkan manajemen literatur Anda.
          </p>
        </div>
        <div className="brand-pattern"></div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="auth-form-side">
        <div className="auth-form-wrapper animate-fade-in">
          <div className="auth-header-minimal">
            <h2>{isLogin ? 'Selamat Datang' : 'Buat Akun'}</h2>
            <p>{isLogin ? 'Masuk dengan kredensial sistem Anda.' : 'Registrasikan diri sebagai member baru.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-core">
            {!isLogin && (
              <div className="form-group-clean">
                <label htmlFor="name">Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group-clean">
              <label htmlFor="email">Alamat Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="nama@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-clean">
              <label htmlFor="password">Kata Sandi</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-clean"
              disabled={submitting}
            >
              {submitting ? 'Memproses...' : (isLogin ? 'Lanjutkan' : 'Daftar')}
            </button>
          </form>

          <div className="auth-footer-clean">
            <span>{isLogin ? 'Anggota baru?' : 'Sudah terdaftar?'}</span>
            <button 
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {isLogin ? 'Buat identitas' : 'Masuk portal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
