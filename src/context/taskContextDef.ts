import { createContext } from 'react';
import type { FilterType, Task, ToastData } from '../types/task';

export interface TaskContextValue {
    tasks: Task[];
    filter: FilterType;
    setFilter: (filter: FilterType) => void;
    editingTask: Task | null;
    startEditing: (task: Task) => void;
    cancelEditing: () => void;
    addTask: (data: Omit<Task, 'id' | 'completed' | 'isPendingDelete'>) => void;
    updateTask: (
        id: number,
        data: Omit<Task, 'id' | 'completed' | 'isPendingDelete'>
    ) => void;
    toggleTask: (id: number) => void;
    requestDelete: (id: number) => void;
    undoDelete: (id: number) => void;
    clearCompleted: () => void;
    resetTasks: () => void;
    toast: ToastData | null;
    dismissToast: () => void;
}

export const TaskContext = createContext<TaskContextValue | null>(null);