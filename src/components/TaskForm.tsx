import { useState, type FormEvent } from 'react';
import { useTaskContext } from '../hooks/useTaskContext';
import type { TaskPriority } from '../types/task';
import './TaskForm.scss';

export function TaskForm() {
    const { addTask, updateTask, editingTask, cancelEditing, isCreating, mutatingId } =
        useTaskContext();

    const [title, setTitle] = useState(editingTask?.title ?? '');
    const [description, setDescription] = useState(editingTask?.description ?? '');
    const [category, setCategory] = useState(editingTask?.category ?? 'React');
    const [priority, setPriority] = useState<TaskPriority>(
        editingTask?.priority ?? 'medium'
    );
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isSubmitting =
        isCreating || (editingTask !== null && mutatingId === editingTask.id);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSuccessMessage('');

        if (!title.trim()) {
            setError('Назва завдання є обов’язковою');
            return;
        }

        const payload = {
            title: title.trim(),
            description: description.trim() || 'Без додаткового опису',
            category: category.trim() || 'General',
            priority,
        };

        if (editingTask) {
            await updateTask(editingTask.id, payload);
        } else {
            const ok = await addTask(payload);
            if (ok) {
                setTitle('');
                setDescription('');
                setCategory('React');
                setPriority('medium');
                setSuccessMessage('Завдання успішно додано до списку!');
            }
        }

        setError('');
    };

    return (
        <form
            className={`task-form ${editingTask ? 'task-form--editing' : ''}`}
            onSubmit={(e) => void handleSubmit(e)}
            noValidate
        >
            <h2 className="task-form__heading">
                {editingTask ? `Редагування: ${editingTask.title}` : 'Нове навчальне завдання'}
            </h2>

            {successMessage && (
                <p className="task-form__success" role="status">
                    {successMessage}
                </p>
            )}

            <div className="task-form__grid">
                <div className="task-form__field task-form__field--full">
                    <label className="task-form__label" htmlFor="task-title">
                        Назва *
                    </label>
                    <input
                        id="task-title"
                        type="text"
                        className={`task-form__input ${error ? 'task-form__input--invalid' : ''}`}
                        placeholder="Наприклад: Розібратися з Repository Pattern"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (error) setError('');
                            if (successMessage) setSuccessMessage('');
                        }}
                        disabled={isSubmitting}
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
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
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
                        disabled={isSubmitting}
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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>
            </div>

            <div className="task-form__actions">
                {editingTask && (
                    <button
                        type="button"
                        className="task-form__cancel"
                        onClick={cancelEditing}
                        disabled={isSubmitting}
                    >
                        Скасувати
                    </button>
                )}
                <button type="submit" className="task-form__submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? 'Збереження...'
                        : editingTask
                            ? 'Зберегти зміни'
                            : 'Додати'}
                </button>
            </div>
        </form>
    );
}