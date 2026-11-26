import { Link } from 'react-router';

export function NotFoundPage() {
    return (
        <div style={{ textAlign: 'center', padding: '48px 16px' }}>
            <h1>404 — Сторінку не знайдено</h1>
            <p>Запитаний маршрут не існує.</p>
            <Link to="/tasks" style={{ color: '#2563eb', fontWeight: 600 }}>
                Повернутися до завдань
            </Link>
        </div>
    );
}