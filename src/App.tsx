import { RouterProvider } from 'react-router/dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { router } from './routes/router';
import './App.scss';

export function App() {
    return (
        <AuthProvider>
            <TaskProvider>
                <RouterProvider router={router} />
            </TaskProvider>
        </AuthProvider>
    );
}

export default App;