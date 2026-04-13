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
      <div className="loading-page">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '800px' }} className="animate-fade-in">
        <div className="auth-logo" style={{ 
          width: '80px', height: '80px', fontSize: '2.4rem', 
          margin: '0 auto 32px',
          fontWeight: '800',
          color: 'white'
        }}>
          RL
        </div>
        <h1 style={{ 
          fontFamily: 'Outfit, sans-serif',
          fontSize: '3.5rem', 
          fontWeight: 800, 
          marginBottom: '20px',
          background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.04em'
        }}>
          RPLibrary
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          marginBottom: '48px',
          lineHeight: 1.6,
          fontWeight: '400'
        }}>
          Transformasi literasi digital di ujung jari Anda.
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            Lab Rekayasa Perangkat Lunak — ITS Surabaya
          </span>
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" className="btn btn-primary btn-lg" style={{ minWidth: '180px' }}>
            Masuk Portal
          </Link>
          <Link href="/catalog" className="btn btn-secondary btn-lg" style={{ minWidth: '180px' }}>
            Eksplorasi Katalog
          </Link>
        </div>

        <div className="stagger-children" style={{ 
          marginTop: '80px', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '24px',
        }}>
          {[
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>, 
              title: 'Keamanan Terjamin', 
              desc: 'Enkripsi data standar industri' 
            },
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>, 
              title: 'Dashboard Cerdas', 
              desc: 'Manajemen koleksi intuitif' 
            },
            { 
              icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>, 
              title: 'Sirkulasi Realtime', 
              desc: 'Peminjaman tanpa hambatan' 
            },
          ].map((feature, i) => (
            <div key={i} className="card" style={{ 
              padding: '32px 24px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ color: 'var(--primary)', marginBottom: '8px' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

