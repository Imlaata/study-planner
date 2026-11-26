import { createContext } from 'react';
import type {
    CreateTaskInput,
    FilterType,
    Task,
    ToastData,
    UpdateTaskInput,
} from '../types/task';

export interface TaskContextValue {
    // Server state
    tasks: Task[];
    total: number;
    isLoading: boolean;
    error: string | null;
    mutatingId: number | null;
    isCreating: boolean;

    // Client / UI state
    page: number;
    limit: number;
    totalPages: number;
    setPage: (page: number) => void;
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    selectedTaskId: number | null;
    selectTask: (id: number | null) => void;
    editingTask: Task | null;
    startEditing: (task: Task) => void;
    cancelEditing: () => void;
    toast: ToastData | null;
    dismissToast: () => void;

    // Operations (Repository + state updates)
    retryFetch: () => void;
    addTask: (input: CreateTaskInput) => Promise<boolean>;
    updateTask: (id: number, input: UpdateTaskInput) => Promise<boolean>;
    toggleTask: (task: Task) => Promise<void>;
    deleteTask: (id: number) => Promise<void>;
}

export const TaskContext = createContext<TaskContextValue | null>(null);