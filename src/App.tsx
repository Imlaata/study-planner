import { TaskProvider } from './context/TaskContext';
import { useTaskContext } from './hooks/useTaskContext';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import { Toast } from './components/Toast';
import './App.scss';

function StudyPlannerContent() {
    const { editingTask } = useTaskContext();

    return (
        <>
            <main className="app">
                <Header />
                <TaskForm key={editingTask?.id ?? 'create'} />
                <TaskStats />
                <TaskFilters />
                <TaskList />
            </main>
            <Toast />
        </>
    );
}

export function App() {
    return (
        <TaskProvider>
            <StudyPlannerContent />
        </TaskProvider>
    );
}

export default App;