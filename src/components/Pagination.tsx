import { useTaskContext } from '../hooks/useTaskContext';
import './Pagination.scss';

export function Pagination() {
    const { page, totalPages, total, setPage, isLoading } = useTaskContext();

    if (total === 0) return null;

    return (
        <nav className="pagination" aria-label="Пагінація списку завдань">
            <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1 || isLoading}
            >
                ← Попередня
            </button>

            <span className="pagination__info">
        Сторінка <strong>{page}</strong> із <strong>{totalPages}</strong> (усього: {total})
      </span>

            <button
                type="button"
                className="pagination__btn"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages || isLoading}
            >
                Наступна →
            </button>
        </nav>
    );
}