import { httpClient } from '../api/httpClient';
import type {
    ApiTodo,
    CreateTaskInput,
    PaginatedTasks,
    Task,
    TodosResponse,
    UpdateTaskInput,
} from '../types/task';

// Mapping з API DTO (ApiTodo) у domain-модель застосунку (Task)
function toTask(
    dto: ApiTodo,
    meta?: Partial<Pick<Task, 'description' | 'priority' | 'category'>>
): Task {
    return {
        id: dto.id,
        title: dto.todo,
        completed: dto.completed,
        description: meta?.description ?? 'Навчальне завдання з REST API (DummyJSON)',
        priority: meta?.priority ?? 'medium',
        category: meta?.category ?? 'General',
    };
}

export const taskRepository = {
    // GET /todos?limit=10&skip=0 (з підтримкою AbortSignal)
    async getAll(limit = 10, skip = 0, signal?: AbortSignal): Promise<PaginatedTasks> {
        const data = await httpClient.get<TodosResponse>(
            `/todos?limit=${limit}&skip=${skip}`,
            signal
        );

        return {
            items: data.todos.map((item) => toTask(item)),
            total: data.total,
            skip: data.skip,
            limit: data.limit,
        };
    },

    // GET /todos/:id (з підтримкою AbortSignal)
    async getById(id: number, signal?: AbortSignal): Promise<Task> {
        const dto = await httpClient.get<ApiTodo>(`/todos/${id}`, signal);
        return toTask(dto);
    },

    // POST /todos/add
    async create(input: CreateTaskInput): Promise<Task> {
        const dto = await httpClient.post<ApiTodo>('/todos/add', {
            todo: input.title,
            completed: false,
            userId: 1,
        });

        // DummyJSON повертає id: 255 для всіх нових записів — робимо його унікальним у межах клієнта
        return toTask(
            { ...dto, id: Date.now() },
            {
                description: input.description,
                priority: input.priority,
                category: input.category,
            }
        );
    },

    // PATCH /todos/:id
    async update(id: number, input: UpdateTaskInput): Promise<Partial<Task>> {
        const payload: Record<string, unknown> = {};
        if (input.title !== undefined) payload.todo = input.title;
        if (input.completed !== undefined) payload.completed = input.completed;

        // Для локально створених задач (id > 254), яких немає в БД DummyJSON,
        // повертаємо оновлення без виклику 404 на сервері
        if (id > 254) {
            return { id, ...input };
        }

        const dto = await httpClient.patch<ApiTodo>(`/todos/${id}`, payload);
        return {
            id: dto.id,
            ...(input.title !== undefined ? { title: dto.todo } : {}),
            ...(input.completed !== undefined ? { completed: dto.completed } : {}),
            ...(input.description !== undefined ? { description: input.description } : {}),
            ...(input.priority !== undefined ? { priority: input.priority } : {}),
            ...(input.category !== undefined ? { category: input.category } : {}),
        };
    },

    // DELETE /todos/:id
    async delete(id: number): Promise<void> {
        if (id > 254) return;
        await httpClient.delete<{ id: number; isDeleted: boolean }>(`/todos/${id}`);
    },
};