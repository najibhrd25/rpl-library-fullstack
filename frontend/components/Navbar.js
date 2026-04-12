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
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {user && (
          <button className="hamburger-btn" onClick={onToggleSidebar}>
            ☰
          </button>
        )}
        <Link href={user ? (user.role === 'ADMIN' ? '/dashboard' : '/catalog') : '/'} className="navbar-brand">
          <span className="logo-icon">📚</span>
          RPLibrary
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
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
