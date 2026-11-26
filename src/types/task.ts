export type TaskPriority = 'low' | 'medium' | 'high';
export type StatusFilter = 'all' | 'completed' | 'uncompleted';
export type PriorityFilter = 'all' | TaskPriority;

// Domain-модель застосунку
export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
    // Client-owned metadata (DummyJSON не підтримує ці поля, тому ними володіє клієнт)
    createdBy: string;
    createdAt: string;
}

// DTO-модель DummyJSON (/todos)
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

export type CreateTaskInput = Omit<Task, 'id' | 'completed' | 'createdBy' | 'createdAt'>;
export type UpdateTaskInput = Partial<Omit<Task, 'id' | 'createdBy' | 'createdAt'>>;

export interface AuthUser {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
}

export interface LoginResponse extends AuthUser {
    accessToken: string;
    refreshToken: string;
}

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastData {
    id: number;
    message: string;
    type: ToastType;
    duration?: number;
}