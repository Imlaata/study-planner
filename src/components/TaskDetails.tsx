import { useState, useEffect } from 'react';
import { taskRepository } from '../repositories/taskRepository';
import { useTaskContext } from '../hooks/useTaskContext';
import type { Task } from '../types/task';
import './TaskDetails.scss';

interface TaskDetailsPanelProps {
    taskId: number;
    onClose: () => void;
}

function TaskDetailsPanel({ taskId, onClose }: TaskDetailsPanelProps) {
    const { tasks } = useTaskContext();

    // Локально створені задачі (id > 254) не існують у БД DummyJSON
    const isLocalTask = taskId > 254;
    const localTask = isLocalTask ? tasks.find((t) => t.id === taskId) ?? null : null;

    const [fetchedDetails, setFetchedDetails] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(!isLocalTask);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);

    useEffect(() => {
        if (isLocalTask) return;

        const controller = new AbortController();

        async function fetchDetails() {
            setIsLoading(true);
            setError(null);

            try {
                const fetched = await taskRepository.getById(taskId, controller.signal);
                setFetchedDetails(fetched);
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

        void fetchDetails();

        return () => {
            controller.abort();
        };
    }, [taskId, isLocalTask, reloadTick]);

    // Поєднуємо дані з API з актуальними локальними метаданими (якщо завдання редагували в UI)
    const existingTask = tasks.find((t) => t.id === taskId);
    const details: Task | null = isLocalTask
        ? localTask
        : fetchedDetails
            ? {
                ...fetchedDetails,
                ...(existingTask
                    ? {
                        title: existingTask.title,
                        completed: existingTask.completed,
                        description: existingTask.description,
                        category: existingTask.category,
                        priority: existingTask.priority,
                    }
                    : {}),
            }
            : null;

    const effectiveError = isLocalTask && !localTask ? 'Локальне завдання не знайдено' : error;

    return (
        <aside className="task-details" aria-label="Деталі завдання">
            <div className="task-details__header">
                <h2 className="task-details__heading">Деталі завдання #{taskId}</h2>
                <button type="button" className="task-details__close" onClick={onClose}>
                    Закрити ✕
                </button>
            </div>

            {isLoading && <p className="task-details__state">Loading details...</p>}

            {!isLoading && effectiveError && (
                <div className="task-details__error-box">
                    <p className="task-details__error-text">Помилка завантаження: {effectiveError}</p>
                    {!isLocalTask && (
                        <button
                            type="button"
                            className="task-details__retry"
                            onClick={() => setReloadTick((prev) => prev + 1)}
                        >
                            Спробувати ще
                        </button>
                    )}
                </div>
            )}

            {!isLoading && !effectiveError && details && (
                <div className="task-details__body">
                    <h3 className="task-details__title">{details.title}</h3>
                    <p className="task-details__description">{details.description}</p>

                    <dl className="task-details__meta">
                        <div className="task-details__meta-item">
                            <dt>Категорія:</dt>
                            <dd>{details.category}</dd>
                        </div>
                        <div className="task-details__meta-item">
                            <dt>Пріоритет:</dt>
                            <dd className={`task-details__priority task-details__priority--${details.priority}`}>
                                {details.priority}
                            </dd>
                        </div>
                        <div className="task-details__meta-item">
                            <dt>Статус:</dt>
                            <dd>{details.completed ? 'Виконано (true)' : 'Не виконано (false)'}</dd>
                        </div>
                    </dl>
                </div>
            )}
        </aside>
    );
}

export function TaskDetails() {
    const { selectedTaskId, selectTask } = useTaskContext();

    if (selectedTaskId === null) return null;

    return (
        <TaskDetailsPanel
            key={selectedTaskId}
            taskId={selectedTaskId}
            onClose={() => selectTask(null)}
        />
    );
}