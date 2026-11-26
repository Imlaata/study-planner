import { useState, useEffect } from 'react';

// 6
// повторно використовуваний типізований хук для синхронізації будь-якого стану з localStorage.
export function useLocalStorage<T>(key: string, initialValue: T) {
    // (лінива ініціалізація) читаємо значення зі сховища лише один раз при першому рендері
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.error(`Помилка читання localStorage за ключем "${key}":`, error);
            return initialValue;
        }
    });

    // (сайд ефекти)  при кожній зміні storedValue оновлюємо запис у localStorage
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Помилка запису в localStorage за ключем "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}