import { useState, type FormEvent } from 'react';
import type { Task, TaskPriority } from '../types/task';
import './TaskForm.scss';

interface TaskFormProps {
    onAddTask: (newTaskData: Omit<Task, 'id' | 'completed'>) => void;
}

export function TaskForm({ onAddTask }: TaskFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('React');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [error, setError] = useState('');

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!title.trim()) {
            setError('Назва завдання є обов’язковою');
            return;
        }

        onAddTask({
            title: title.trim(),
            description: description.trim() || 'Без додаткового опису',
            category: category.trim() || 'Загальне',
            priority,
        });

        setTitle('');
        setDescription('');
        setCategory('React');
        setPriority('medium');
        setError('');
    };

    return (
        <form className="task-form" onSubmit={handleSubmit} noValidate>
            <h2 className="task-form__heading">Нове навчальне завдання</h2>

            <div className="task-form__grid">
                <div className="task-form__field task-form__field--full">
                    <label className="task-form__label" htmlFor="task-title">
                        Назва *
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        className={`task-form__input ${error ? 'task-form__input--invalid' : ''}`}
                        placeholder="Наприклад: Вивчити хук useState"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (error) setError('');
                        }}
                    />
                    {error && <span className="task-form__error">{error}</span>}
                </div>

                <div className="task-form__field">
                    <label className="task-form__label" htmlFor="task-category">
                        Категорія
                    </label>
                    <input
                        id="task-category"
                        type="text"
                        className="task-form__input"
                        placeholder="React, TypeScript, Git..."
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    />
                </div>

                <div className="task-form__field">
                    <label className="task-form__label" htmlFor="task-priority">
                        Пріоритет
                    </label>
                    <select
                        id="task-priority"
                        className="task-form__select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    >
                        <option value="low">Low (Низький)</option>
                        <option value="medium">Medium (Середній)</option>
                        <option value="high">High (Високий)</option>
                    </select>
                </div>

                <div className="task-form__field task-form__field--full">
                    <label className="task-form__label" htmlFor="task-description">
                        Опис
                    </label>
                    <textarea
                        id="task-description"
                        className="task-form__textarea"
                        placeholder="Короткий опис завдання..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>

            <div className="task-form__actions">
                <button type="submit" className="task-form__submit">
                    Додати
                </button>
            </div>
        </form>
    );
}