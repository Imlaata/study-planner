import { useContext } from 'react';
import { AuthContext } from '../context/authContextDef';

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth повинен використовуватися всередині AuthProvider');
    }
    return context;
}