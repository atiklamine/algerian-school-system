export type UserRole = 'super_admin' | 'director' | 'teacher' | 'student' | 'parent';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: string[];
    meta?: {
        timestamp: string;
        version: string;
    };
}
