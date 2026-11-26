import { httpClient } from '../api/httpClient';
import type {
    ApiTodo,
    CreateTaskInput,
    PaginatedTasks,
    Task,
    TodosResponse,
    UpdateTaskInput,
} from '../types/task';

// Mapping DTO -> Domain Model із додаванням client-owned metadata (createdBy, createdAt)
function toTask(
    dto: ApiTodo,
    meta?: Partial<Pick<Task, 'description' | 'priority' | 'category' | 'createdBy' | 'createdAt'>>
): Task {
    return {
        id: dto.id,
        title: dto.todo,
        completed: dto.completed,
        description: meta?.description ?? 'Навчальне завдання з REST API (DummyJSON)',
        priority: meta?.priority ?? 'medium',
        category: meta?.category ?? 'General',
        // Client-owned metadata (DummyJSON не зберігає автора та дату створення)
        createdBy: meta?.createdBy ?? `user-${dto.userId}`,
        createdAt: meta?.createdAt ?? '2026-11-26',
    };
}

export const taskRepository = {
    async getAll(limit = 10, skip = 0, signal?: AbortSignal): Promise<PaginatedTasks> {
        const data = await httpClient.get<TodosResponse>(
            `/todos?limit=${limit}&skip=${skip}`,
            { signal }
        );

        return {
            items: data.todos.map((item) => toTask(item)),
            total: data.total,
            skip: data.skip,
            limit: data.limit,
        };
    },

    async getById(id: number, signal?: AbortSignal): Promise<Task> {
        const dto = await httpClient.get<ApiTodo>(`/todos/${id}`, { signal });
        return toTask(dto);
    },

    // Авторизований запит (передає Authorization: Bearer <token>)
    async create(input: CreateTaskInput, authorUsername: string): Promise<Task> {
        const dto = await httpClient.post<ApiTodo>(
            '/todos/add',
            {
                todo: input.title,
                completed: false,
                userId: 1,
            },
            { auth: true }
        );

        return toTask(
            { ...dto, id: Date.now() },
            {
                description: input.description,
                priority: input.priority,
                category: input.category,
                createdBy: authorUsername,
                createdAt: new Date().toISOString().split('T')[0],
            }
        );
    },

    // Авторизований запит (передає Authorization: Bearer <token>)
    async update(id: number, input: UpdateTaskInput): Promise<Partial<Task>> {
        const payload: Record<string, unknown> = {};
        if (input.title !== undefined) payload.todo = input.title;
        if (input.completed !== undefined) payload.completed = input.completed;

        if (id > 254) {
            return { id, ...input };
        }

        const dto = await httpClient.patch<ApiTodo>(`/todos/${id}`, payload, { auth: true });
        return {
            id: dto.id,
            ...(input.title !== undefined ? { title: dto.todo } : {}),
            ...(input.completed !== undefined ? { completed: dto.completed } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.priority !== undefined ? { priority: input.priority } : {}),
            ...(input.category !== undefined ? { category: input.category } : {}),
        };
    },

    // Авторизований запит (передає Authorization: Bearer <token>)
    async delete(id: number): Promise<void> {
        if (id > 254) return;
        await httpClient.delete<{ id: number; isDeleted: boolean }>(`/todos/${id}`, {
            auth: true,
        });
    },
};