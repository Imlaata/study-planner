import { createContext } from 'react';
import type {
    CreateTaskInput,
    Task,
    ToastData,
    UpdateTaskInput,
} from '../types/task';

export interface TaskContextValue {
    tasks: Task[];
    total: number;
    isLoading: boolean;
    error: string | null;
    mutatingId: number | null;
    isCreating: boolean;

    page: number;
    limit: number;
    totalPages: number;
    setPage: (page: number) => void;

    toast: ToastData | null;
    dismissToast: () => void;
    showToast: (message: string, type?: ToastData['type']) => void;

    retryFetch: () => void;
    addTask: (input: CreateTaskInput) => Promise<boolean>;
    updateTask: (id: number, input: UpdateTaskInput) => Promise<boolean>;
    toggleTask: (task: Task) => Promise<void>;
    deleteTask: (id: number) => Promise<boolean>;
}

export const TaskContext = createContext<TaskContextValue | null>(null);