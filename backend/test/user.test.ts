import request from 'supertest';
import express from 'express';
import userRoutes from '../src/services/user-service/routes';
import authRoutes from '../src/services/auth-service/routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);

describe('User Service Endpoints', () => {
    let token: string;

    // Cleanup before tests
    beforeAll(async () => {
        // Create a user and get token
        const uniqueSuffix = Date.now();
        const userPayload = {
            username: `teacher${uniqueSuffix}`,
            email: `teacher${uniqueSuffix}@school.dz`,
            password: 'SecurePassword123!',
            role: 'Teacher'
        };

        // Register
        await request(app).post('/auth/register').send(userPayload);

        // Login
        const res = await request(app).post('/auth/login').send({
            email: userPayload.email,
            password: userPayload.password
        });

        token = res.body.data.accessToken;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should fail (401) when fetching students without token', async () => {
        const res = await request(app).get('/users/students');
        expect(res.status).toBe(401);
    });

    it('should fetch students with valid token', async () => {
        const res = await request(app)
            .get('/users/students')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        // Expect success structure
        expect(res.body.success).toBe(true);
    });

    it('should fail (401) when fetching teachers without token', async () => {
        const res = await request(app).get('/users/teachers');
        expect(res.status).toBe(401);
    });

    it('should fetch teachers with valid token', async () => {
        const res = await request(app)
            .get('/users/teachers')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });
});
