import {
    useState,
    useEffect,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import { taskRepository } from '../repositories/taskRepository';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TaskContext, type TaskContextValue } from './taskContextDef';
import type {
    CreateTaskInput,
    FilterType,
    Task,
    ToastData,
    ToastType,
    UpdateTaskInput,
} from '../types/task';

const FILTER_STORAGE_KEY = 'study-planner-filter-v2';
const PAGE_LIMIT = 10;

function isAbortError(err: unknown): boolean {
    return err instanceof DOMException && err.name === 'AbortError';
}

export function TaskProvider({ children }: { children: ReactNode }) {
    // Server state (не дублюється в localStorage)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reloadTick, setReloadTick] = useState(0);
    const [isCreating, setIsCreating] = useState(false);
    const [mutatingId, setMutatingId] = useState<number | null>(null);

    // Client / UI state
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useLocalStorage<FilterType>(FILTER_STORAGE_KEY, 'all');
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
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

    // Автоприховування Toast
    useEffect(() => {
        if (!toast) return;
        const timerId = window.setTimeout(() => setToast(null), toast.duration ?? 3500);
        return () => window.clearTimeout(timerId);
    }, [toast]);

    // Завантаження списку з пагінацією + скасування попереднього запиту через AbortController
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
                // Скасований запит не показуємо як помилку завантаження
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

    // Синхронізація заголовка вкладки браузера з активними завданнями на сторінці
    useEffect(() => {
        const activeCount = tasks.filter((t) => !t.completed).length;
        document.title = `Study Planner — ${activeCount} active ${
            activeCount === 1 ? 'task' : 'tasks'
        }`;
    }, [tasks]);

    const retryFetch = useCallback(() => {
        setReloadTick((prev) => prev + 1);
    }, []);

    // POST: створення завдання + оновлення client state
    const addTask = useCallback(
        async (input: CreateTaskInput): Promise<boolean> => {
            setIsCreating(true);
            try {
                const created = await taskRepository.create(input);
                setTasks((prev) => [created, ...prev]);
                setTotal((prev) => prev + 1);
                showToast('Завдання успішно створено (POST /todos/add)', 'success');
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
        [showToast]
    );

    // PATCH: редагування завдання
    const updateTask = useCallback(
        async (id: number, input: UpdateTaskInput): Promise<boolean> => {
            setMutatingId(id);
            try {
                const updatedFields = await taskRepository.update(id, input);
                setTasks((prev) =>
                    prev.map((task) => (task.id === id ? { ...task, ...updatedFields } : task))
                );
                setEditingTask(null);
                showToast('Завдання оновлено (PATCH /todos/:id)', 'success');
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
        [showToast]
    );

    // PATCH: перемикання статусу completed
    const toggleTask = useCallback(
        async (task: Task): Promise<void> => {
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
        [showToast]
    );

    // DELETE: видалення завдання
    const deleteTask = useCallback(
        async (id: number): Promise<void> => {
            setMutatingId(id);
            try {
                await taskRepository.delete(id);
                setTasks((prev) => prev.filter((item) => item.id !== id));
                setTotal((prev) => Math.max(0, prev - 1));
                if (selectedTaskId === id) setSelectedTaskId(null);
                if (editingTask?.id === id) setEditingTask(null);
                showToast('Завдання видалено (DELETE /todos/:id)', 'info');
            } catch (err) {
                showToast(
                    err instanceof Error ? err.message : 'Не вдалося видалити завдання',
                    'error'
                );
            } finally {
                setMutatingId(null);
            }
        },
        [selectedTaskId, editingTask, showToast]
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
            filter,
            setFilter,
            selectedTaskId,
            selectTask: setSelectedTaskId,
            editingTask,
            startEditing: setEditingTask,
            cancelEditing: () => setEditingTask(null),
            toast,
            dismissToast,
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
            filter,
            setFilter,
            selectedTaskId,
            editingTask,
            toast,
            dismissToast,
            retryFetch,
            addTask,
            updateTask,
            toggleTask,
            deleteTask,
        ]
    );

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}