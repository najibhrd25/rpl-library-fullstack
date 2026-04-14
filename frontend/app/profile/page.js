'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/lib/ToastContext';
import { useRouter } from 'next/navigation';
import ApiService from '@/lib/api';
import StudentLayout from '@/components/StudentLayout';

export default function ProfilePage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const data = await ApiService.getProfile();
      setProfile(data.data.user);
    } catch (err) {
      toast.error('Gagal memuat profil');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    setUploading(true);
    try {
      await ApiService.uploadProfilePicture(file);
      toast.success('Foto profil berhasil diperbarui! 📷');
      fetchProfile();
      refreshUser();
    } catch (err) {
      toast.error(err.message || 'Gagal mengupload foto');
    } finally {
      setUploading(false);
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  if (authLoading || !user) {
    return <StudentLayout><div className="loading-page"><div className="loading-spinner"></div></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <div className="page-header">
        <h1 className="page-title">Profil Pengguna</h1>
        <p className="page-subtitle">Informasi akun dan pengaturan profil Anda</p>
      </div>

      {loading ? (
        <div className="loading-page"><div className="loading-spinner"></div><div className="loading-text">Memuat profil...</div></div>
      ) : profile ? (
        <div className="card animate-fade-in" style={{ padding: '32px' }}>
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} />
                ) : (
                  getInitial(profile.name)
                )}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="loading-spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}></div>
                    Mengupload...
                  </span>
                ) : (
                  '📷 Ubah Foto'
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleUploadPhoto}
              />
            </div>

            <div className="profile-details">
              <h2 className="profile-name">{profile.name}</h2>
              <p className="profile-email">{profile.email}</p>
              <span className={`role-badge ${profile.role?.toLowerCase()}`} style={{ marginBottom: '24px', display: 'inline-flex' }}>
                {profile.role === 'ADMIN' ? '👑 ' : '📚 '}{profile.role}
              </span>

              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <div className="profile-info-label">Nama</div>
                  <div className="profile-info-value">{profile.name}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Email</div>
                  <div className="profile-info-value">{profile.email}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Role</div>
                  <div className="profile-info-value">{profile.role === 'ADMIN' ? 'Administrator' : 'Member'}</div>
                </div>
                <div className="profile-info-item">
                  <div className="profile-info-label">Bergabung Sejak</div>
                  <div className="profile-info-value">
                    {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <div className="empty-title">Profil tidak ditemukan</div>
        </div>
      )}
    </StudentLayout>
  );
}
