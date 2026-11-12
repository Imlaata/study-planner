export type TaskPriority = 'low' | 'medium' | 'high';

export type FilterType = 'all' | 'completed' | 'uncompleted';

export interface Task {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    priority: TaskPriority;
    category: string;
}