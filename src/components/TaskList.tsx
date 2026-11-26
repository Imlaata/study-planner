import { useTaskContext } from '../hooks/useTaskContext';
import { TaskItem } from './TaskItem';
import './TaskList.scss';

export function TaskList() {
    const { tasks, filter, isLoading, error, retryFetch } = useTaskContext();

    if (isLoading) {
        return (
            <div className="task-list__state" role="status">
                <p className="task-list__state-title">Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="task-list__state task-list__state--error" role="alert">
                <p className="task-list__state-title">Помилка завантаження.</p>
                <p className="task-list__state-text">{error}</p>
                <button
                    type="button"
                    className="task-list__retry-btn"
                    onClick={retryFetch}
                >
                    Спробувати ще
                </button>
            </div>
        );
    }

    const filteredTasks = tasks.filter((task) => {
        if (filter === 'completed') return task.completed;
        if (filter === 'uncompleted') return !task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        return (
            <div className="task-list__empty">
                <p className="task-list__empty-title">Завдань не знайдено.</p>
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