import {
    useReducer,
    useEffect,
    useState,
    useCallback,
    useMemo,
    type ReactNode,
} from 'react';
import { initialTasks } from '../data/initialTasks';
import { taskReducer } from '../reducers/taskReducer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { TaskContext, type TaskContextValue } from './taskContextDef';
import type { FilterType, Task, ToastData, ToastType } from '../types/task';

const TASKS_STORAGE_KEY = 'study-planner-tasks-v1';
const FILTER_STORAGE_KEY = 'study-planner-filter-v1';
const UNDO_TIMEOUT_MS = 5000;

function loadInitialTasks(): Task[] {
    try {
        const raw = window.localStorage.getItem(TASKS_STORAGE_KEY);
        if (!raw) return initialTasks;
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return initialTasks;

        return parsed.map((item: Task) => ({
            ...item,
            isPendingDelete: false,
        }));
    } catch (error) {
        console.error('Пошкоджені дані в localStorage, завантажено початковий список:', error);
        return initialTasks;
    }
}

export function TaskProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(taskReducer, undefined, loadInitialTasks);
    const [filter, setFilter] = useLocalStorage<FilterType>(FILTER_STORAGE_KEY, 'all');
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<ToastData | null>(null);

    const showToast = useCallback(
        (message: string, type: ToastType = 'info', undoTaskId?: number, duration = 3500) => {
            setToast({
                id: Date.now(),
                message,
                type,
                undoTaskId,
                duration,
            });
        },
        []
    );

    const dismissToast = useCallback(() => {
        setToast(null);
    }, []);

    // 1. Синхронізація tasks з localStorage
    useEffect(() => {
        try {
            const cleanTasks = tasks.map((task) => {
                const copy = { ...task };
                delete copy.isPendingDelete;
                return copy;
            });
            window.localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cleanTasks));
        } catch (error) {
            console.error('Помилка збереження у localStorage:', error);
        }
    }, [tasks]);

    // 2. Синхронізація заголовка вкладки браузера з кількістю активних завдань
    useEffect(() => {
        const activeCount = tasks.filter((t) => !t.completed && !t.isPendingDelete).length;
        document.title = `Study Planner — ${activeCount} active ${
            activeCount === 1 ? 'task' : 'tasks'
        }`;
    }, [tasks]);

    // 3. Таймер Undoable Delete (5 секунд)
    const pendingTask = tasks.find((t) => t.isPendingDelete);
    const pendingTaskId = pendingTask?.id;

    useEffect(() => {
        if (pendingTaskId === undefined) return;

        const timerId = window.setTimeout(() => {
            dispatch({ type: 'confirmDelete', payload: { id: pendingTaskId } });
            showToast('Завдання остаточно видалено', 'info');
        }, UNDO_TIMEOUT_MS);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [pendingTaskId, showToast]);

    // 4. Автоматичне приховування звичайних Toast-повідомлень
    useEffect(() => {
        if (!toast || toast.undoTaskId !== undefined) return;

        const timerId = window.setTimeout(() => {
            setToast(null);
        }, toast.duration ?? 3500);

        return () => {
            window.clearTimeout(timerId);
        };
    }, [toast]);

    const addTask = useCallback(
        (data: Omit<Task, 'id' | 'completed' | 'isPendingDelete'>) => {
            dispatch({ type: 'add', payload: data });
            showToast('Завдання успішно створено', 'success');
        },
        [showToast]
    );

    const updateTask = useCallback(
        (id: number, data: Omit<Task, 'id' | 'completed' | 'isPendingDelete'>) => {
            dispatch({ type: 'update', payload: { id, ...data } });
            setEditingTask(null);
            showToast('Зміни збережено', 'success');
        },
        [showToast]
    );

    const toggleTask = useCallback((id: number) => {
        dispatch({ type: 'toggle', payload: { id } });
    }, []);

    const requestDelete = useCallback(
        (id: number) => {
            if (pendingTaskId !== undefined && pendingTaskId !== id) {
                dispatch({ type: 'confirmDelete', payload: { id: pendingTaskId } });
            }
            if (editingTask?.id === id) {
                setEditingTask(null);
            }
            dispatch({ type: 'requestDelete', payload: { id } });
            showToast('Завдання буде видалено через 5 с', 'warning', id, UNDO_TIMEOUT_MS);
        },
        [pendingTaskId, editingTask, showToast]
    );

    const undoDelete = useCallback(
        (id: number) => {
            dispatch({ type: 'undoDelete', payload: { id } });
            showToast('Видалення скасовано', 'info');
        },
        [showToast]
    );

    const clearCompleted = useCallback(() => {
        const completedCount = tasks.filter((t) => t.completed).length;
        if (completedCount === 0) {
            showToast('Немає виконаних завдань для очищення', 'error');
            return;
        }
        dispatch({ type: 'clearCompleted' });
        showToast(`Очищено виконаних завдань: ${completedCount}`, 'info');
    }, [tasks, showToast]);

    const resetTasks = useCallback(() => {
        dispatch({ type: 'reset', payload: initialTasks });
        setEditingTask(null);
        showToast('Дані скинуто до початкових', 'info');
    }, [showToast]);

    const startEditing = useCallback((task: Task) => {
        setEditingTask(task);
    }, []);

    const cancelEditing = useCallback(() => {
        setEditingTask(null);
    }, []);

    const value = useMemo<TaskContextValue>(
        () => ({
            tasks,
            filter,
            setFilter,
            editingTask,
            startEditing,
            cancelEditing,
            addTask,
            updateTask,
            toggleTask,
            requestDelete,
            undoDelete,
            clearCompleted,
            resetTasks,
            toast,
            dismissToast,
        }),
        [
            tasks,
            filter,
            setFilter,
            editingTask,
            startEditing,
            cancelEditing,
            addTask,
            updateTask,
            toggleTask,
            requestDelete,
            undoDelete,
            clearCompleted,
            resetTasks,
            toast,
            dismissToast,
        ]
    );

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}