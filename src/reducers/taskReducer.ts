import type { Task, TaskPriority } from '../types/task';

export type TaskAction =
    | { type: 'add'; payload: Omit<Task, 'id' | 'completed' | 'isPendingDelete'> }
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
    | { type: 'requestDelete'; payload: { id: number } }
    | { type: 'confirmDelete'; payload: { id: number } }
    | { type: 'undoDelete'; payload: { id: number } }
    | { type: 'clearCompleted' }
    | { type: 'reset'; payload: Task[] };

export function taskReducer(state: Task[], action: TaskAction): Task[] {
    switch (action.type) {
        case 'add': {
            const newTask: Task = {
                id: Date.now(),
                completed: false,
                isPendingDelete: false,
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

        case 'requestDelete':
            return state.map((task) =>
                task.id === action.payload.id
                    ? { ...task, isPendingDelete: true }
                    : { ...task, isPendingDelete: false }
            );

        case 'confirmDelete':
            return state.filter((task) => task.id !== action.payload.id);

        case 'undoDelete':
            return state.map((task) =>
                task.id === action.payload.id ? { ...task, isPendingDelete: false } : task
            );

        case 'clearCompleted':
            return state.filter((task) => !task.completed);

        case 'reset':
            return action.payload;

        default:
            return state;
    }
}