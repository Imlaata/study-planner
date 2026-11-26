import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import { taskRepository } from '../repositories/taskRepository';
import { useAuth } from '../hooks/useAuth';
import { TaskContext, type TaskContextValue } from './taskContextDef';
import type {
    CreateTaskInput,
    Task,
    ToastData,
    ToastType,
    UpdateTaskInput,
} from '../types/task';

const PAGE_LIMIT = 10;

function isAbortError(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'AbortError';
}

export function TaskProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, user } = useAuth();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const [mutatingId, setMutatingId] = useState<number | null>(null);

    const [page, setPage] = useState(1);
    const [toast, setToast] = useState<ToastData | null>(null);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', duration = 3500) => {
            setToast({ id: Date.now(), message, type, duration });
        },
        []
    );

    const dismissToast = useCallback(() => {
        setToast(null);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timerId = window.setTimeout(() => setToast(null), toast.duration ?? 3500);
        return () => window.clearTimeout(timerId);
    }, [toast]);

    // Завантаження списку з пагінацією + скасування попереднього GET-запиту через AbortController
    useEffect(() => {
        const controller = new AbortController();
        const skip = (page - 1) * PAGE_LIMIT;

        async function loadTasks() {
            setIsLoading(true);
            setError(null);

            try {
                const result = await taskRepository.getAll(PAGE_LIMIT, skip, controller.signal);
                setTasks(result.items);
                setTotal(result.total);
            } catch (err) {
                if (isAbortError(err)) return;
                setError(
                    err instanceof Error ? err.message : 'Помилка завантаження списку завдань'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadTasks();

        return () => {
            controller.abort();
        };
    }, [page, reloadTick]);

    const retryFetch = useCallback(() => {
        setReloadTick((prev) => prev + 1);
    }, []);

    // Захищена дія: створення завдання
    const addTask = useCallback(
        async (input: CreateTaskInput): Promise<boolean> => {
            if (!isAuthenticated) {
                showToast('Для створення завдання потрібно увійти в систему', 'warning');
                return false;
            }

            setIsCreating(true);
            try {
                const created = await taskRepository.create(input, user?.username ?? 'emilys');
                setTasks((prev) => [created, ...prev]);
                setTotal((prev) => prev + 1);
                showToast('Завдання успішно створено', 'success');
                return true;
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'Не вдалося створити завдання',
                    'error'
                );
                return false;
            } finally {
                setIsCreating(false);
            }
        },
        [isAuthenticated, user, showToast]
    );

    // Захищена дія: оновлення завдання
    const updateTask = useCallback(
        async (id: number, input: UpdateTaskInput): Promise<boolean> => {
            if (!isAuthenticated) {
                showToast('Для редагування завдання потрібна авторизація', 'warning');
                return false;
            }

            setMutatingId(id);
            try {
                const updatedFields = await taskRepository.update(id, input);
                setTasks((prev) =>
                    prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
                );
                showToast('Зміни збережено', 'success');
                return true;
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'Помилка оновлення завдання',
                    'error'
                );
                return false;
            } finally {
                setMutatingId(null);
            }
        },
        [isAuthenticated, showToast]
    );

    // Захищена дія: перемикання completed
    const toggleTask = useCallback(
        async (task: Task): Promise<void> => {
            if (!isAuthenticated) {
                showToast('Увійдіть, щоб змінювати статус завдання', 'warning');
                return;
            }

            setMutatingId(task.id);
            try {
                const updatedFields = await taskRepository.update(task.id, {
                    completed: !task.completed,
                });
                setTasks((prev) =>
                    prev.map((item) =>
                        item.id === task.id ? { ...item, ...updatedFields } : item
                    )
                );
                showToast(
                    !task.completed ? 'Позначено як виконане' : 'Повернуто в роботу',
                    'info'
                );
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'Не вдалося змінити статус',
                    'error'
                );
            } finally {
                setMutatingId(null);
            }
        },
        [isAuthenticated, showToast]
    );

    // Захищена дія: видалення завдання
    const deleteTask = useCallback(
        async (id: number): Promise<boolean> => {
            if (!isAuthenticated) {
                showToast('Для видалення завдання потрібна авторизація', 'warning');
                return false;
            }

            setMutatingId(id);
            try {
                await taskRepository.delete(id);
                setTasks((prev) => prev.filter((item) => item.id !== id));
                setTotal((prev) => Math.max(0, prev - 1));
                showToast('Завдання видалено', 'info');
                return true;
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'Не вдалося видалити завдання',
                    'error'
                );
                return false;
            } finally {
                setMutatingId(null);
            }
        },
        [isAuthenticated, showToast]
    );

    const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

    const value = useMemo<TaskContextValue>(
        () => ({
            tasks,
            total,
            isLoading,
            error,
            mutatingId,
            isCreating,
            page,
            limit: PAGE_LIMIT,
            totalPages,
            setPage,
            toast,
            dismissToast,
            showToast,
            retryFetch,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
        }),
        [
            tasks,
            total,
            isLoading,
            error,
            mutatingId,
            isCreating,
            page,
            totalPages,
            toast,
            dismissToast,
            showToast,
            retryFetch,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
        ]
    );

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}