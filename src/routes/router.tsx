import { createBrowserRouter, redirect } from 'react-router';
import { AUTH_TOKEN_KEY } from '../api/httpClient';
import { AppLayout } from '../layouts/AppLayout';
import { TasksPage } from '../pages/TasksPage';
import { TaskDetailsPage } from '../pages/TaskDetailsPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Protected loader для Data Mode: перевіряє сесію та перенаправляє гостя на /login
function requireUserLoader() {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
        return redirect('/login');
    }
    return null;
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                loader: () => redirect('/tasks'),
            },
            {
                path: 'tasks',
                element: <TasksPage />,
            },
            {
                path: 'tasks/:taskId',
                element: <TaskDetailsPage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'profile',
                loader: requireUserLoader,
                element: <ProfilePage />,
            },
            {
                path: '*',
                element: <NotFoundPage />,
            },
        ],
    },
]);