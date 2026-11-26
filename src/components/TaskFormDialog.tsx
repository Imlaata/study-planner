import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { taskSchema, type TaskFormData } from '../schemas/taskSchema';
import type { Task } from '../types/task';
import './TaskFormDialog.scss';

export interface TaskFormDialogProps {
    open: boolean;
    mode: 'create' | 'edit';
    task?: Task;
    onClose: () => void;
    onSubmit: (data: TaskFormData) => Promise<void>;
}

export function TaskFormDialog({
                                   open,
                                   mode,
                                   task,
                                   onClose,
                                   onSubmit,
                               }: TaskFormDialogProps) {
    const titleInputRef = useRef<HTMLInputElement | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TaskFormData>({
        resolver: zodResolver(taskSchema),
        defaultValues: {
            title: task?.title ?? '',
            description: task?.description ?? '',
            category: task?.category ?? 'React',
            priority: task?.priority ?? 'medium',
        },
    });

    // Синхронізація значень при відкритті для create або edit
    useEffect(() => {
        if (!open) return;

        reset({
            title: mode === 'edit' && task ? task.title : '',
            description: mode === 'edit' && task ? task.description : '',
            category: mode === 'edit' && task ? task.category : 'React',
            priority: mode === 'edit' && task ? task.priority : 'medium',
        });

        const focusTimer = window.setTimeout(() => {
            titleInputRef.current?.focus();
        }, 10);

        return () => window.clearTimeout(focusTimer);
    }, [open, mode, task, reset]);

    // Закриття модального діалогу по клавіші Escape
    useEffect(() => {
        if (!open) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isSubmitting) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, isSubmitting, onClose]);

    if (!open) return null;

    const titleRegistration = register('title');

    const handleFormSubmit = async (data: TaskFormData) => {
        await onSubmit({
            ...data,
            description: data.description || 'Без додаткового опису',
        });
    };

    return (
        <div
            className="task-dialog__backdrop"
            role="presentation"
            onClick={() => {
                if (!isSubmitting) onClose();
            }}
        >
            <div
                className="task-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="task-dialog-title"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="task-dialog__header">
                    <h2 id="task-dialog-title" className="task-dialog__title">
                        {mode === 'create' ? 'Нове завдання' : `Редагування завдання #${task?.id}`}
                    </h2>
                    <button
                        type="button"
                        className="task-dialog__close"
                        onClick={onClose}
                        disabled={isSubmitting}
                        aria-label="Закрити діалог"
                    >
                        ✕
                    </button>
                </div>

                <form
                    className="task-dialog__form"
                    onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
                    noValidate
                >
                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor="dialog-task-title">
                            Назва *
                        </label>
                        <input
                            id="dialog-task-title"
                            type="text"
                            className={`task-dialog__input ${
                                errors.title ? 'task-dialog__input--invalid' : ''
                            }`}
                            placeholder="Введіть назву завдання"
                            disabled={isSubmitting}
                            {...titleRegistration}
                            ref={(el) => {
                                titleRegistration.ref(el);
                                titleInputRef.current = el;
                            }}
                        />
                        {errors.title && (
                            <span className="task-dialog__error">{errors.title.message}</span>
                        )}
                    </div>

                    <div className="task-dialog__row">
                        <div className="task-dialog__field">
                            <label className="task-dialog__label" htmlFor="dialog-task-category">
                                Категорія *
                            </label>
                            <input
                                id="dialog-task-category"
                                type="text"
                                className={`task-dialog__input ${
                                    errors.category ? 'task-dialog__input--invalid' : ''
                                }`}
                                disabled={isSubmitting}
                                {...register('category')}
                            />
                            {errors.category && (
                                <span className="task-dialog__error">{errors.category.message}</span>
                            )}
                        </div>

                        <div className="task-dialog__field">
                            <label className="task-dialog__label" htmlFor="dialog-task-priority">
                                Пріоритет
                            </label>
                            <select
                                id="dialog-task-priority"
                                className="task-dialog__select"
                                disabled={isSubmitting}
                                {...register('priority')}
                            >
                                <option value="low">Low (Низький)</option>
                                <option value="medium">Medium (Середній)</option>
                                <option value="high">High (Високий)</option>
                            </select>
                        </div>
                    </div>

                    <div className="task-dialog__field">
                        <label className="task-dialog__label" htmlFor="dialog-task-description">
                            Опис
                        </label>
                        <textarea
                            id="dialog-task-description"
                            className={`task-dialog__textarea ${
                                errors.description ? 'task-dialog__input--invalid' : ''
                            }`}
                            rows={3}
                            placeholder="Опишіть деталі виконання..."
                            disabled={isSubmitting}
                            {...register('description')}
                        />
                        {errors.description && (
                            <span className="task-dialog__error">{errors.description.message}</span>
                        )}
                    </div>

                    <div className="task-dialog__actions">
                        <button
                            type="button"
                            className="task-dialog__btn task-dialog__btn--cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="task-dialog__btn task-dialog__btn--submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? 'Збереження...'
                                : mode === 'create'
                                    ? 'Створити'
                                    : 'Зберегти зміни'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}