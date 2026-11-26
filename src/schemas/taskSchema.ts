import { z } from 'zod';

export const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(3, 'Назва повинна містити щонайменше 3 символи')
        .max(120, 'Назва занадто довга (макс. 120 символів)'),
    description: z
        .string()
        .trim()
        .max(500, 'Опис не може перевищувати 500 символів'),
    category: z
        .string()
        .trim()
        .min(1, 'Вкажіть категорію'),
    priority: z.enum(['low', 'medium', 'high']),
});

export type TaskFormData = z.infer<typeof taskSchema>;