import { useState } from 'react';
import { initialTasks } from './data/initialTasks';
import type { FilterType, Task } from './types/task';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { TaskStats } from './components/TaskStats';
import { TaskFilters } from './components/TaskFilters';
import { TaskList } from './components/TaskList';
import './App.scss';

export function App() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<FilterType>('all');

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      id: Date.now(),
      completed: false,
      ...newTaskData,
    };

    setTasks((prevTasks) => [newTask, ...prevTasks]);
  };

  const handleToggleTask = (id: number) => {
    setTasks((prevTasks) =>
        prevTasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
        )
    );
  };

  const handleDeleteTask = (id: number) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'uncompleted') return !task.completed;
    return true;
  });

  return (
      <main className="app">
        <Header />
        <TaskForm onAddTask={handleAddTask} />
        <TaskStats tasks={tasks} />
        <TaskFilters currentFilter={filter} onFilterChange={setFilter} />
        <TaskList
            tasks={filteredTasks}
            hasAnyTasks={tasks.length > 0}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
        />
      </main>
  );
}

export default App;