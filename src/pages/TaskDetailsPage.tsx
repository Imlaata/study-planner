import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router';
import { taskRepository } from '../repositories/taskRepository';
import { useTaskContext } from '../hooks/useTaskContext';
import { useAuth } from '../hooks/useAuth';
import { TaskFormDialog } from '../components/TaskFormDialog';
import type { TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';
import './TaskDetailsPage.scss';

export function TaskDetailsPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const numericId = Number(taskId);
    const isValidId = Number.isInteger(numericId) && numericId > 0;

    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const { tasks, updateTask, deleteTask, mutatingId } = useTaskContext();

    const isLocalTask = isValidId && numericId > 254;
    const localTaskFromContext = isValidId
        ? tasks.find((t) => t.id === numericId) ?? null
        : null;

    const [fetchedTask, setFetchedTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(isValidId && !isLocalTask);
    const [error, setError] = useState<string | null>(
        isValidId ? null : 'Некоректний ідентифікатор завдання у URL'
    );
    const [reloadTick, setReloadTick] = useState(0);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isValidId || isLocalTask) return;

        const controller = new AbortController();

        async function loadTaskDetails() {
            setIsLoading(true);
            setError(null);

            try {
                const data = await taskRepository.getById(numericId, controller.signal);
                setFetchedTask(data);
            } catch (err) {
                if (err instanceof DOMException && err.name === 'AbortError') return;
                setError(
                    err instanceof Error ? err.message : 'Не вдалося завантажити деталі завдання'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadTaskDetails();

        return () => {
            controller.abort();
        };
    }, [numericId, isValidId, isLocalTask, reloadTick]);

    const task: Task | null = isLocalTask
        ? localTaskFromContext
        : fetchedTask
            ? {
                ...fetchedTask,
                ...(localTaskFromContext
                    ? {
                        title: localTaskFromContext.title,
                        completed: localTaskFromContext.completed,
                        description: localTaskFromContext.description,
                        category: localTaskFromContext.category,
                        priority: localTaskFromContext.priority,
                        createdBy: localTaskFromContext.createdBy,
                        createdAt: localTaskFromContext.createdAt,
                    }
                    : {}),
            }
            : null;

    const effectiveError =
        isLocalTask && !localTaskFromContext ? 'Завдання не знайдено' : error;

    // Захищена дія: відкриття редагування
    const handleEditClick = () => {
        if (!isAuthenticated) {
            void navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setSuccessMessage(null);
        setIsEditOpen(true);
    };

    const handleEditSubmit = async (data: TaskFormData) => {
        if (!task) return;
        const ok = await updateTask(task.id, data);
        if (ok) {
            setFetchedTask((prev) => (prev ? { ...prev, ...data } : prev));
            setIsEditOpen(false);
            setSuccessMessage('Завдання успішно оновлено!');
        }
    };

    // Захищена дія: видалення завдання
    const handleDeleteRequest = () => {
        if (!isAuthenticated) {
            void navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setIsConfirmingDelete(true);
    };

    const handleDeleteConfirm = async () => {
        if (!task) return;
        const ok = await deleteTask(task.id);
        if (ok) {
            void navigate('/tasks');
        }
    };

    const isBusy = task !== null && mutatingId === task.id;

    return (
        <div className="details-page">
            <div className="details-page__nav">
                <Link to="/tasks" className="details-page__back">
                    ← Назад до списку завдань
                </Link>
            </div>

            {isLoading && (
                <div className="details-page__state" role="status">
                    Loading task #{taskId}...
                </div>
            )}

            {!isLoading && effectiveError && (
                <div className="details-page__state details-page__state--error" role="alert">
                    <p>Помилка завантаження: {effectiveError}</p>
                    {isValidId && !isLocalTask && (
                        <button
                            type="button"
                            className="details-page__retry"
                            onClick={() => setReloadTick((prev) => prev + 1)}
                        >
                            Спробувати ще
                        </button>
                    )}
                </div>
            )}

            {!isLoading && !effectiveError && task && (
                <article className="details-page__card">
                    {successMessage && (
                        <p className="details-page__success" role="status">
                            {successMessage}
                        </p>
                    )}

                    <div className="details-page__header">
                        <span className="details-page__id">Завдання #{task.id}</span>
                        <div className="details-page__actions">
                            <button
                                type="button"
                                className="details-page__btn details-page__btn--edit"
                                onClick={handleEditClick}
                                disabled={isBusy}
                            >
                                Редагувати
                            </button>

                            {isConfirmingDelete ? (
                                <>
                                    <button
                                        type="button"
                                        className="details-page__btn details-page__btn--delete"
                                        onClick={() => void handleDeleteConfirm()}
                                        disabled={isBusy}
                                    >
                                        {isBusy ? 'Видалення...' : 'Підтвердити видалення'}
                                    </button>
                                    <button
                                        type="button"
                                        className="details-page__btn details-page__btn--cancel"
                                        onClick={() => setIsConfirmingDelete(false)}
                                        disabled={isBusy}
                                    >
                                        Скасувати
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="details-page__btn details-page__btn--delete"
                                    onClick={handleDeleteRequest}
                                    disabled={isBusy}
                                >
                                    Видалити
                                </button>
                            )}
                        </div>
                    </div>

                    <h1 className="details-page__title">{task.title}</h1>
                    <p className="details-page__description">{task.description}</p>

                    <dl className="details-page__grid">
                        <div className="details-page__meta">
                            <dt>Категорія</dt>
                            <dd>{task.category}</dd>
                        </div>
                        <div className="details-page__meta">
                            <dt>Пріоритет</dt>
                            <dd>{task.priority}</dd>
                        </div>
                        <div className="details-page__meta">
                            <dt>Стан виконання</dt>
                            <dd>{task.completed ? 'Виконано' : 'Не виконано'}</dd>
                        </div>
                        <div className="details-page__meta">
                            <dt>Хто створив (client metadata)</dt>
                            <dd>{task.createdBy}</dd>
                        </div>
                        <div className="details-page__meta">
                            <dt>Дата створення (client metadata)</dt>
                            <dd>{task.createdAt}</dd>
                        </div>
                    </dl>

                    <TaskFormDialog
                        open={isEditOpen}
                        mode="edit"
                        task={task}
                        onClose={() => setIsEditOpen(false)}
                        onSubmit={handleEditSubmit}
                    />
                </article>
            )}
        </div>
    );
}