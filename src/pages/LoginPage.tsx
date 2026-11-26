import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Navigate } from 'react-router';
import { loginSchema, type LoginFormData } from '../schemas/authSchema';
import { useAuth } from '../hooks/useAuth';
import './LoginPage.scss';

export function LoginPage() {
    const { isAuthenticated, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [serverError, setServerError] = useState<string | null>(null);

    const from =
        (location.state as { from?: string } | null)?.from ?? '/tasks';

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const onSubmit = async (data: LoginFormData) => {
        setServerError(null);
        try {
            await login(data.username, data.password);
            void navigate(from, { replace: true });
        } catch (err) {
            setServerError(
                err instanceof Error ? err.message : 'Помилка входу. Перевірте логін і пароль.'
            );
        }
    };

    const fillDemoCredentials = () => {
        setValue('username', 'emilys', { shouldValidate: true });
        setValue('password', 'emilyspass', { shouldValidate: true });
    };

    return (
        <div className="login-page">
            <div className="login-page__card">
                <h1 className="login-page__title">Вхід у Study Planner</h1>
                <p className="login-page__subtitle">
                    Авторизація через DummyJSON API для керування завданнями
                </p>

                {serverError && (
                    <div className="login-page__server-error" role="alert">
                        {serverError}
                    </div>
                )}

                <form
                    className="login-page__form"
                    onSubmit={(e) => void handleSubmit(onSubmit)(e)}
                    noValidate
                >
                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor="login-username">
                            Username
                        </label>
                        <input
                            id="login-username"
                            type="text"
                            className={`login-page__input ${
                                errors.username ? 'login-page__input--invalid' : ''
                            }`}
                            placeholder="emilys"
                            disabled={isSubmitting}
                            {...register('username')}
                        />
                        {errors.username && (
                            <span className="login-page__error">{errors.username.message}</span>
                        )}
                    </div>

                    <div className="login-page__field">
                        <label className="login-page__label" htmlFor="login-password">
                            Password
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            className={`login-page__input ${
                                errors.password ? 'login-page__input--invalid' : ''
                            }`}
                            placeholder="Мінімум 6 символів"
                            disabled={isSubmitting}
                            {...register('password')}
                        />
                        {errors.password && (
                            <span className="login-page__error">{errors.password.message}</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="login-page__submit"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Виконується вхід...' : 'Увійти'}
                    </button>
                </form>

                <div className="login-page__hint">
                    <span>Тестові дані: emilys / emilyspass</span>
                    <button
                        type="button"
                        className="login-page__fill-btn"
                        onClick={fillDemoCredentials}
                    >
                        Підставити
                    </button>
                </div>
            </div>
        </div>
    );
}