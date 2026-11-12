import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
    task: Task;
    onToggleTask: (id: number) => void;
    onDeleteTask: (id: number) => void;
}

export function TaskItem({ task, onToggleTask, onDeleteTask }: TaskItemProps) {
    return (
        <article className={`task-item ${task.completed ? 'task-item--completed' : ''}`}>
            <div className="task-item__content">
                <div className="task-item__header">
                    <h3
                        className={`task-item__title ${
                            task.completed ? 'task-item__title--completed' : ''
                        }`}
                    >
                        {task.title}
                    </h3>

                    <span className="task-item__badge task-item__category">{task.category}</span>

                    <span
                        className={`task-item__badge task-item__priority task-item__priority--${task.priority}`}
                    >
            {task.priority}
          </span>
                </div>

                <p className="task-item__description">{task.description}</p>

                <span
                    className={`task-item__status ${
                        task.completed ? 'task-item__status--completed' : ''
                    }`}
                >
          {task.completed ? 'Статус: Виконано' : 'Статус: У процесі'}
        </span>
            </div>

            <div className="task-item__actions">
                <button
                    type="button"
                    className={`task-item__btn ${
                        task.completed ? 'task-item__btn--undo' : 'task-item__btn--toggle'
                    }`}
                    onClick={() => onToggleTask(task.id)}
                >
                    {task.completed ? 'Повернути в роботу' : 'Виконано'}
                </button>

                <button
                    type="button"
                    className="task-item__btn task-item__btn--delete"
                    onClick={() => onDeleteTask(task.id)}
                >
                    Видалити
                </button>
            </div>
        </article>
    );
}