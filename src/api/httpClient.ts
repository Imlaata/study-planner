const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://dummyjson.com';
export const AUTH_TOKEN_KEY = 'study-planner-access-token';

export class HttpError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'HttpError';
        this.status = status;
    }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
    body?: unknown;
    auth?: boolean;
    token?: string | null;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers, auth = false, token, ...rest } = options;

    const resolvedToken =
        token !== undefined
            ? token
            : auth
                ? window.localStorage.getItem(AUTH_TOKEN_KEY)
                : null;

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(headers as Record<string, string> | undefined),
    };

    if (resolvedToken) {
        requestHeaders.Authorization = `Bearer ${resolvedToken}`;
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...rest,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        let serverMessage = response.statusText || 'Помилка HTTP-запиту';
        try {
            const errorData = (await response.json()) as { message?: string };
            if (errorData?.message) serverMessage = errorData.message;
        } catch {
            // Ігноруємо помилку парсингу, якщо тіло помилки не JSON
        }
        throw new HttpError(response.status, `HTTP ${response.status}: ${serverMessage}`);
    }

    return (await response.json()) as T;
}

export const httpClient = {
    get: <T>(endpoint: string, options?: { signal?: AbortSignal; auth?: boolean; token?: string | null }) =>
        request<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, body: unknown, options?: { auth?: boolean; token?: string | null }) =>
        request<T>(endpoint, { method: 'POST', body, ...options }),

    patch: <T>(endpoint: string, body: unknown, options?: { auth?: boolean; token?: string | null }) =>
        request<T>(endpoint, { method: 'PATCH', body, ...options }),

    delete: <T>(endpoint: string, options?: { auth?: boolean; token?: string | null }) =>
        request<T>(endpoint, { method: 'DELETE', ...options }),
};