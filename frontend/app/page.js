'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const { user, loading } = useAuth();
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

  if (loading) {
    return (
      <div className="loading-page" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '600px' }}>
        <div className="auth-logo" style={{ 
          width: '80px', height: '80px', fontSize: '2.2rem', 
          margin: '0 auto 24px',
          animation: 'float 3s ease-in-out infinite'
        }}>
          📚
        </div>
        <h1 style={{ 
          fontFamily: 'Outfit, sans-serif',
          fontSize: '3rem', 
          fontWeight: 800, 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #F1F1F6 0%, #818CF8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          RPLibrary
        </h1>
        <p style={{ 
          fontSize: '1.15rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '40px',
          lineHeight: 1.7
        }}>
          Sistem Manajemen Perpustakaan Digital
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Lab RPL — Institut Teknologi Sepuluh Nopember
          </span>
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '160px' }}>
            🔐 Masuk
          </Link>
          <Link href="/catalog" className="btn btn-secondary btn-lg" style={{ minWidth: '160px' }}>
            📖 Lihat Katalog
          </Link>
        </div>
        <div style={{ 
          marginTop: '60px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px',
        }}>
          {[
            { icon: '🔒', title: 'Autentikasi Aman', desc: 'JWT & bcrypt' },
            { icon: '📊', title: 'Dashboard Admin', desc: 'CRUD Lengkap' },
            { icon: '🔄', title: 'Sistem Peminjaman', desc: 'Otomatis & Realtime' },
          ].map((feature, i) => (
            <div key={i} className="card-glass" style={{ 
              padding: '20px', 
              textAlign: 'center',
              animation: `fadeInUp 0.5s ease forwards ${(i + 1) * 0.15}s`,
              opacity: 0,
            }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{feature.icon}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {feature.title}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
