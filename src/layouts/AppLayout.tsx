import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { Toast } from '../components/Toast';
import './AppLayout.scss';

export function AppLayout() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        void navigate('/tasks');
    };

    return (
        <div className="layout">
            <header className="layout__header">
                <div className="layout__header-inner">
                    <NavLink to="/tasks" className="layout__brand">
                        Study Planner
                    </NavLink>

                    <nav className="layout__nav" aria-label="Головна навігація">
                        <NavLink
                            to="/tasks"
                            className={({ isActive }) =>
                                `layout__link ${isActive ? 'layout__link--active' : ''}`
                            }
                        >
                            Tasks
                        </NavLink>

                        <NavLink
                            to="/profile"
                            className={({ isActive }) =>
                                `layout__link ${isActive ? 'layout__link--active' : ''}`
                            }
                        >
                            Profile
                        </NavLink>

                        {isAuthenticated ? (
                            <div className="layout__auth-group">
                                {user && <span className="layout__username">@{user.username}</span>}
                                <button
                                    type="button"
                                    className="layout__auth-btn layout__auth-btn--logout"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                className={({ isActive }) =>
                                    `layout__auth-btn ${isActive ? 'layout__auth-btn--active' : ''}`
                                }
                            >
                                Login
                            </NavLink>
                        )}
                    </nav>
                </div>
            </header>

            <main className="layout__content">
                <Outlet />
            </main>

            <Toast />
        </div>
    );
}