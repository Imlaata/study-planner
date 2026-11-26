export type TaskPriority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'completed' | 'uncompleted';

// Domain-модель застосунку
export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
}

// DTO-модель, яку повертає DummyJSON API
export interface ApiTodo {
    id: number;
    todo: string;
    completed: boolean;
    userId: number;
}

export interface TodosResponse {
    todos: ApiTodo[];
    total: number;
    skip: number;
    limit: number;
}

export interface PaginatedTasks {
    items: Task[];
    total: number;
    skip: number;
    limit: number;
}

export type CreateTaskInput = Omit<Task, 'id' | 'completed'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id'>>;

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}