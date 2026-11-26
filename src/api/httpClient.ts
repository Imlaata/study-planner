const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'https://dummyjson.com';

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
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, headers, ...rest } = options;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        throw new HttpError(
            response.status,
            `HTTP помилка ${response.status}: ${response.statusText || 'Не вдалося виконати запит'}`
        );
    }

    return (await response.json()) as T;
}

export const httpClient = {
    get: <T>(endpoint: string, signal?: AbortSignal) =>
        request<T>(endpoint, { method: 'GET', signal }),

    post: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'POST', body }),

    patch: <T>(endpoint: string, body: unknown) =>
        request<T>(endpoint, { method: 'PATCH', body }),

    delete: <T>(endpoint: string) =>
        request<T>(endpoint, { method: 'DELETE' }),
};