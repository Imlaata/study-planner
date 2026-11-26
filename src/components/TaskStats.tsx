import { useTaskContext } from '../hooks/useTaskContext';
import './TaskStats.scss';


export function TaskStats() {
    const { tasks } = useTaskContext(); //компонент сам дістає масив завдань із контексту і рахує статистику

    const totalCount = tasks.length;
    const completedCount = tasks.filter((task) => task.completed).length;
    const uncompletedCount = totalCount - completedCount;

    return (
        <section className="task-stats" aria-label="Статистика завдань">
            <div className="task-stats__card">
                <span className="task-stats__value">{totalCount}</span>
                <span className="task-stats__label">Усього завдань</span>
            </div>

            <div className="task-stats__card">
                <span className="task-stats__value task-stats__value--completed">{completedCount}</span>
                <span className="task-stats__label">Виконано</span>
            </div>

            <div className="task-stats__card">
                <span className="task-stats__value task-stats__value--uncompleted">{uncompletedCount}</span>
                <span className="task-stats__label">Не виконано</span>
            </div>
        </section>
    );
}