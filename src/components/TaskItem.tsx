import { useState } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { Task } from '../types/task';
import './TaskItem.scss';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const {
        toggleTask,
        deleteTask,
        startEditing,
        selectTask,
        selectedTaskId,
        mutatingId,
    } = useTaskContext();

    // Локальний стан підтвердження видалення (без використання забороненого alert/confirm)
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

    const isBusy = mutatingId === task.id;
    const isSelected = selectedTaskId === task.id;

    return (
        <article
            className={`task-item ${task.completed ? 'task-item--completed' : ''} ${
                isSelected ? 'task-item--selected' : ''
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
                {isConfirmingDelete ? (
                    <>
                        <button
                            type="button"
                            className="task-item__btn task-item__btn--delete"
                            disabled={isBusy}
                            onClick={() => void deleteTask(task.id)}
                        >
                            {isBusy ? 'Видалення...' : 'Підтвердити видалення'}
                        </button>
                        <button
                            type="button"
                            className="task-item__btn task-item__btn--edit"
                            disabled={isBusy}
                            onClick={() => setIsConfirmingDelete(false)}
                        >
                            Скасувати
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            className="task-item__btn task-item__btn--details"
                            onClick={() => selectTask(task.id)}
                            disabled={isBusy}
                        >
                            Деталі
                        </button>

                        <button
                            type="button"
                            className="task-item__btn task-item__btn--edit"
                            onClick={() => startEditing(task)}
                            disabled={isBusy}
                        >
                            Редагувати
                        </button>

                        <button
                            type="button"
                            className={`task-item__btn ${
                                task.completed ? 'task-item__btn--undo' : 'task-item__btn--toggle'
                            }`}
                            onClick={() => void toggleTask(task)}
                            disabled={isBusy}
                        >
                            {task.completed ? 'Повернути в роботу' : 'Виконано'}
                        </button>

                        <button
                            type="button"
                            className="task-item__btn task-item__btn--delete"
                            onClick={() => setIsConfirmingDelete(true)}
                            disabled={isBusy}
                        >
                            Видалити
                        </button>
                    </>
                )}
            </div>
        </article>
    );
}