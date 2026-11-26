import { useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import './ProfilePage.scss';

export function ProfilePage() {
    const { user, isAuthenticated, isRestoringSession, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        void navigate('/login');
    };

    if (isRestoringSession) {
        return <div className="profile-page__loading">Завантаження профілю...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-page__card">
                <div className="profile-page__header">
                    <h1 className="profile-page__title">Профіль користувача</h1>
                    <span className="profile-page__status">
            {isAuthenticated ? 'Авторизований' : 'Не авторизований'}
          </span>
                </div>

                <dl className="profile-page__info">
                    <div className="profile-page__row">
                        <dt>Username:</dt>
                        <dd>{user?.username ?? 'emilys'}</dd>
                    </div>
                    <div className="profile-page__row">
                        <dt>Email:</dt>
                        <dd>{user?.email ?? 'emily.johnson@x.dummyjson.com'}</dd>
                    </div>
                    <div className="profile-page__row">
                        <dt>Ім’я:</dt>
                        <dd>
                            {user ? `${user.firstName} ${user.lastName}` : 'Emily Johnson'}
                        </dd>
                    </div>
                    <div className="profile-page__row">
                        <dt>Статус сесії:</dt>
                        <dd>Активний Bearer Token</dd>
                    </div>
                </dl>

                <button
                    type="button"
                    className="profile-page__logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}