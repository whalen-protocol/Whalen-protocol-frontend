import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/Layout.css';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/register');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h1>⚡ Whalen Protocol</h1>
        </div>
        <div className="navbar-menu">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link to="/discovery" className={`nav-link ${isActive('/discovery')}`}>
            Discovery
          </Link>
          <Link to="/my-requests" className={`nav-link ${isActive('/my-requests')}`}>
            My Requests
          </Link>
          <Link to="/my-matches" className={`nav-link ${isActive('/my-matches')}`}>
            My Matches
          </Link>
          <Link to="/verification" className={`nav-link ${isActive('/verification')}`}>
            Verification
          </Link>
        </div>
        <div className="navbar-user">
          <span className="user-name">{user?.name}</span>
          <span className="user-type">{user?.type}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
