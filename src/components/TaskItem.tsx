import { useTaskContext } from '../hooks/useTaskContext';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const { toggleTask, requestDelete, undoDelete, startEditing } = useTaskContext();

    const isPending = Boolean(task.isPendingDelete);

    return (
        <article
            className={`task-item ${task.completed ? 'task-item--completed' : ''} ${
                isPending ? 'task-item--pending-delete' : ''
            }`}
        >
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

                    {isPending && (
                        <span className="task-item__badge task-item__pending-badge">
              Буде видалено...
            </span>
                    )}
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
                {isPending ? (
                    <button
                        type="button"
                        className="task-item__btn task-item__btn--undo"
                        onClick={() => undoDelete(task.id)}
                    >
                        Скасувати видалення
                    </button>
                ) : (
                    <>
                        <button
                            type="button"
                            className="task-item__btn task-item__btn--edit"
                            onClick={() => startEditing(task)}
                        >
                            Редагувати
                        </button>

                        <button
                            type="button"
                            className={`task-item__btn ${
                                task.completed ? 'task-item__btn--undo' : 'task-item__btn--toggle'
                            }`}
                            onClick={() => toggleTask(task.id)}
                        >
                            {task.completed ? 'Повернути в роботу' : 'Виконано'}
                        </button>

                        <button
                            type="button"
                            className="task-item__btn task-item__btn--delete"
                            onClick={() => requestDelete(task.id)}
                        >
                            Видалити
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}