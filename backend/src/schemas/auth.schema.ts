import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
    }),
});

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email({ message: "Invalid email address" }),
        username: z.string().min(3, { message: "Username must be at least 3 characters long" }),
        password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
        role: z.enum(["Director", "Teacher", "Student"], {
            message: "Role must be one of: Director, Teacher, Student"
        }),
    }),
});
