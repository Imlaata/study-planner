import { useTaskContext } from '../hooks/useTaskContext';
import type { FilterType } from '../types/task';
import './TaskFilters.scss';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Всі' },
    { value: 'uncompleted', label: 'Не виконані' },
    { value: 'completed', label: 'Виконані' },
];

export function TaskFilters() {
    const { filter, setFilter, retryFetch, isLoading } = useTaskContext();

    return (
        <div className="task-filters">
            <div className="task-filters__tabs" role="group" aria-label="Фільтри завдань">
                {FILTER_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className={`task-filters__btn ${
                            filter === option.value ? 'task-filters__btn--active' : ''
                        }`}
                        onClick={() => setFilter(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <div className="task-filters__bulk">
                <button
                    type="button"
                    className="task-filters__action task-filters__action--reset"
                    onClick={retryFetch}
                    disabled={isLoading}
                >
                    {isLoading ? 'Оновлення...' : 'Оновити з API'}
                </button>
            </div>
        </div>
    );
}