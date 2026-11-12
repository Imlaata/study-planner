import type { FilterType } from '../types/task';
import './TaskFilters.scss';

interface TaskFiltersProps {
    currentFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Всі' },
    { value: 'uncompleted', label: 'Не виконані' },
    { value: 'completed', label: 'Виконані' },
];

export function TaskFilters({ currentFilter, onFilterChange }: TaskFiltersProps) {
    return (
        <div className="task-filters" role="group" aria-label="Фільтри завдань">
            {FILTER_OPTIONS.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    className={`task-filters__btn ${
                        currentFilter === option.value ? 'task-filters__btn--active' : ''
                    }`}
                    onClick={() => onFilterChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}