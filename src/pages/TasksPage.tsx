import { useState } from 'react';
import { Link, useSearchParams, useNavigate, useLocation } from 'react-router';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import { TaskStats } from '../components/TaskStats';
import { Pagination } from '../components/Pagination';
import { TaskFormDialog } from '../components/TaskFormDialog';
import type { TaskFormData } from '../schemas/taskSchema';
import type { PriorityFilter, StatusFilter } from '../types/task';
import './TasksPage.scss';

export function TasksPage() {
    const { tasks, isLoading, error, retryFetch, addTask, toggleTask, mutatingId } =
        useTaskContext();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Query params у URL (/tasks?status=completed&priority=high)
    const [searchParams, setSearchParams] = useSearchParams();
    const statusParam = (searchParams.get('status') as StatusFilter | null) ?? 'all';
    const priorityParam = (searchParams.get('priority') as PriorityFilter | null) ?? 'all';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [successBanner, setSuccessBanner] = useState<string | null>(null);

    const updateQueryParam = (key: 'status' | 'priority', value: string) => {
        const next = new URLSearchParams(searchParams);
        if (value === 'all') {
            next.delete(key);
        } else {
            next.set(key, value);
        }
        setSearchParams(next, { replace: true });
    };

    // Авторизація для створення завдання: гість -> /login, авторизований -> TaskFormDialog
    const handleOpenCreate = () => {
        if (!isAuthenticated) {
            void navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
            return;
        }
        setSuccessBanner(null);
        setIsCreateOpen(true);
    };

    const handleCreateSubmit = async (data: TaskFormData) => {
        const created = await addTask(data);
        if (created) {
            setIsCreateOpen(false);
            setSuccessBanner(`Завдання «${data.title}» успішно створено!`);
        }
    };

    const filteredTasks = tasks.filter((task) => {
        if (statusParam === 'completed' && !task.completed) return false;
        if (statusParam === 'uncompleted' && task.completed) return false;
        if (priorityParam !== 'all' && task.priority !== priorityParam) return false;
        return true;
    });

    return (
        <div className="tasks-page">
            <div className="tasks-page__top">
                <div>
                    <h1 className="tasks-page__title">Навчальні завдання</h1>
                    <p className="tasks-page__subtitle">
                        Керування завданнями через REST API, Query Params та захищені дії
                    </p>
                </div>

                <button
                    type="button"
                    className="tasks-page__add-btn"
                    onClick={handleOpenCreate}
                    title={
                        isAuthenticated
                            ? 'Створити нове завдання'
                            : 'Увійдіть, щоб створити завдання'
                    }
                >
                    + Нове завдання
                </button>
            </div>

            {successBanner && (
                <div className="tasks-page__success" role="status">
                    <span>{successBanner}</span>
                    <button
                        type="button"
                        className="tasks-page__success-close"
                        onClick={() => setSuccessBanner(null)}
                    >
                        ✕
                    </button>
                </div>
            )}

            <TaskStats />

            {/* Панель фільтрації, прив'язана до URL Query Params */}
            <section className="tasks-page__filters" aria-label="Фільтри URL">
                <div className="tasks-page__filter-group">
                    <label className="tasks-page__filter-label" htmlFor="filter-status">
                        Статус (status):
                    </label>
                    <select
                        id="filter-status"
                        className="tasks-page__select"
                        value={statusParam}
                        onChange={(e) => updateQueryParam('status', e.target.value)}
                    >
                        <option value="all">Усі</option>
                        <option value="uncompleted">Не виконані</option>
                        <option value="completed">Виконані</option>
                    </select>
                </div>

                <div className="tasks-page__filter-group">
                    <label className="tasks-page__filter-label" htmlFor="filter-priority">
                        Пріоритет (priority):
                    </label>
                    <select
                        id="filter-priority"
                        className="tasks-page__select"
                        value={priorityParam}
                        onChange={(e) => updateQueryParam('priority', e.target.value)}
                    >
                        <option value="all">Усі</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                {(statusParam !== 'all' || priorityParam !== 'all') && (
                    <button
                        type="button"
                        className="tasks-page__reset-btn"
                        onClick={() => setSearchParams({}, { replace: true })}
                    >
                        Скинути фільтри
                    </button>
                )}
            </section>

            {isLoading && (
                <div className="tasks-page__state" role="status">
                    Loading...
                </div>
            )}

            {!isLoading && error && (
                <div className="tasks-page__state tasks-page__state--error" role="alert">
                    <p>Помилка завантаження: {error}</p>
                    <button type="button" className="tasks-page__retry-btn" onClick={retryFetch}>
                        Спробувати ще
                    </button>
                </div>
            )}

            {!isLoading && !error && filteredTasks.length === 0 && (
                <div className="tasks-page__state">Завдань не знайдено.</div>
            )}

            {!isLoading && !error && filteredTasks.length > 0 && (
                <div className="tasks-page__list">
                    {filteredTasks.map((task) => {
                        const isBusy = mutatingId === task.id;
                        return (
                            <article
                                key={task.id}
                                className={`tasks-page__card ${
                                    task.completed ? 'tasks-page__card--completed' : ''
                                }`}
                            >
                                <div className="tasks-page__card-main">
                                    <div className="tasks-page__card-header">
                                        <Link to={`/tasks/${task.id}`} className="tasks-page__card-title">
                                            {task.title}
                                        </Link>
                                        <span className="tasks-page__badge">{task.category}</span>
                                        <span
                                            className={`tasks-page__badge tasks-page__badge--${task.priority}`}
                                        >
                      {task.priority}
                    </span>
                                    </div>
                                    <p className="tasks-page__card-meta">
                                        Автор: {task.createdBy} · Створено: {task.createdAt}
                                    </p>
                                </div>

                                <div className="tasks-page__card-actions">
                                    <button
                                        type="button"
                                        className="tasks-page__btn tasks-page__btn--toggle"
                                        disabled={isBusy}
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                void navigate('/login', {
                                                    state: { from: `${location.pathname}${location.search}` },
                                                });
                                                return;
                                            }
                                            void toggleTask(task);
                                        }}
                                    >
                                        {task.completed ? 'Повернути' : 'Виконано'}
                                    </button>

                                    <Link
                                        to={`/tasks/${task.id}`}
                                        className="tasks-page__btn tasks-page__btn--details"
                                    >
                                        Відкрити →
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            <Pagination />

            <TaskFormDialog
                open={isCreateOpen}
                mode="create"
                onClose={() => setIsCreateOpen(false)}
                onSubmit={handleCreateSubmit}
            />
        </div>
    );
}