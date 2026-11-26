import { useContext } from 'react';
import { TaskContext } from '../context/taskContextDef';

// 6
// інкапсулює звернення до useContext(TaskContext) та гарантує перевірку,
// що компонент знаходиться всередині <TaskProvider> (інакше викидає зрозумілу помилку).
export function useTaskContext() {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext повинен використовуватися всередині TaskProvider');
    }
    return context;
}