'use client';

import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <nav className="navbar animate-fade-in">
      <div className="flex items-center gap-md">
        {user && (
          <button className="hamburger-btn" onClick={onToggleSidebar} aria-label="Toggle Menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        )}
        <Link href={user ? (user.role === 'ADMIN' ? '/dashboard' : '/catalog') : '/'} className="navbar-brand">
          <div className="logo-icon">RL</div>
          <span>RPLibrary</span>
        </Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link href="/profile" className="navbar-user">
              <div className="navbar-avatar">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} />
                ) : (
                  getInitial(user.name)
                )}
              </div>
              <span className="navbar-username">{user.name}</span>
              <span className={`role-badge ${user.role?.toLowerCase()}`}>
                {user.role}
              </span>
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              Keluar
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            Masuk
          </Link>
        )}
      </div>
    </nav>
  );
}

