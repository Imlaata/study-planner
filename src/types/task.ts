export type TaskPriority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'completed' | 'uncompleted';

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
    isPendingDelete?: boolean;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
    id: number;
    message: string;
    type: ToastType;
    undoTaskId?: number;
    duration?: number;
}