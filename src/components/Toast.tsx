import { useTaskContext } from '../hooks/useTaskContext';
import './Toast.scss';

export function Toast() {
    const { toast, dismissToast } = useTaskContext();

    if (!toast) return null;

    return (
        <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role="status"
            aria-live="polite"
        >
            <div className="toast__body">
                <span className="toast__message">{toast.message}</span>
                <button
                    type="button"
                    className="toast__btn toast__btn--close"
                    onClick={dismissToast}
                    aria-label="Закрити сповіщення"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}