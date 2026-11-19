import { useTaskContext } from '../hooks/useTaskContext';
import './Toast.scss';

export function Toast() {
    const { toast, undoDelete, dismissToast } = useTaskContext();

    if (!toast) return null;

    const isUndoable = toast.undoTaskId !== undefined;

    return (
        <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            role="status"
            aria-live="polite"
        >
            <div className="toast__body">
                <span className="toast__message">{toast.message}</span>

                <div className="toast__actions">
                    {isUndoable && (
                        <button
                            type="button"
                            className="toast__btn toast__btn--undo"
                            onClick={() => undoDelete(toast.undoTaskId!)}
                        >
                            Скасувати (Undo)
                        </button>
                    )}
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

            {isUndoable && (
                <div
                    className="toast__progress"
                    style={{ animationDuration: `${toast.duration ?? 5000}ms` }}
                />
            )}
        </div>
    );
}