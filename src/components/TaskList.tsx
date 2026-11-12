import type { Task } from '../types/task';
import { TaskItem } from './TaskItem';
import './TaskList.scss';

interface TaskListProps {
    tasks: Task[];
    hasAnyTasks: boolean;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
}

export function TaskList({ tasks, hasAnyTasks, onToggleTask, onDeleteTask }: TaskListProps) {
    if (!hasAnyTasks) {
        return (
            <div className="task-list__empty">
                <p className="task-list__empty-title">Завдань поки немає.</p>
                <p className="task-list__empty-text">Додайте перше навчальне завдання.</p>
            </div>
        );
    }

    if (tasks.length === 0) {
        return (
            <div className="task-list__empty">
                <p className="task-list__empty-title">За цим фільтром завдань немає.</p>
            </div>
        );
    }

    return (
        <section className="task-list" aria-label="Список навчальних завдань">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onToggleTask={onToggleTask}
                    onDeleteTask={onDeleteTask}
                />
            ))}
        </section>
    );
}