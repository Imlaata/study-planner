import type { Task, TaskPriority } from '../types/task';

export type TaskAction =
    | { type: 'add'; payload: Omit<Task, 'id' | 'completed'> }
    | { type: 'toggle'; payload: { id: number } }
    | {
    type: 'update';
    payload: {
        id: number;
        title: string;
        description: string;
        priority: TaskPriority;
        category: string;
    };
}
    | { type: 'delete'; payload: { id: number } }
    | { type: 'reset'; payload: Task[] };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case 'add': {
            const newTask: Task = {
                id: Date.now(),
                completed: false,
                ...action.payload,
            };
            return [newTask, ...state];
        }

        case 'toggle':
            return state.map((task) =>
                task.id === action.payload.id ? { ...task, completed: !task.completed } : task
            );

        case 'update':
            return state.map((task) =>
                task.id === action.payload.id
                    ? {
                        ...task,
                        title: action.payload.title,
                        description: action.payload.description,
                        priority: action.payload.priority,
                        category: action.payload.category,
                    }
                    : task
            );

        case 'delete':
            return state.filter((task) => task.id !== action.payload.id);

        case 'reset':
            return action.payload;

        default:
            return state;
    }
}