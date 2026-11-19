import { useTaskContext } from '../hooks/useTaskContext';
import { TaskItem } from './TaskItem';
import './TaskList.scss';

export function TaskList() {
    const { tasks, filter } = useTaskContext();

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'completed') return task.completed;
        if (filter === 'uncompleted') return !task.completed;
        return true;
    });

    if (tasks.length === 0) {
        return (
            <div className="task-list__empty">
                <p className="task-list__empty-title">Завдань поки немає.</p>
                <p className="task-list__empty-text">Додайте перше навчальне завдання.</p>
            </div>
        );
    }

    if (filteredTasks.length === 0) {
        return (
            <div className="task-list__empty">
                <p className="task-list__empty-title">За цим фільтром завдань немає.</p>
            </div>
        );
    }

    return (
        <section className="task-list" aria-label="Список навчальних завдань">
            {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
            ))}
        </section>
    );
}