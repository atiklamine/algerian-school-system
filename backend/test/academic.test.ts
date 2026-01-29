import request from 'supertest';
import express from 'express';
import academicRoutes from '../src/services/academic-service/routes';
import authRoutes from '../src/services/auth-service/routes';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use('/academic', academicRoutes);

describe('Academic Service Endpoints', () => {
    let token: string;

    // Cleanup before tests
    beforeAll(async () => {
        // Create a user and get token
        const uniqueSuffix = Date.now();
        const userPayload = {
            username: `admin${uniqueSuffix}`,
            email: `admin${uniqueSuffix}@school.dz`,
            password: 'SecurePassword123!',
            role: 'Director'
        };

        // Register
        await request(app).post('/auth/register').send(userPayload);

        // Login
        const res = await request(app).post('/auth/login').send({
            email: userPayload.email,
            password: userPayload.password
        });

        if (res.status !== 200) {
            console.error('Login failed during test setup:', res.body);
        }
        token = res.body.data.accessToken;
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should fail (401) when creating academic year without token', async () => {
        const res = await request(app)
            .post('/academic/years')
            .send({
                name: '2025-2026',
                startDate: '2025-09-01',
                endDate: '2026-06-30',
                isCurrent: false
            });

        expect(res.status).toBe(401);
    });

    it('should create an academic year with valid token', async () => {
        const uniqueName = `2024-2025-${Date.now()}`;
        const res = await request(app)
            .post('/academic/years')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: uniqueName,
                startDate: '2024-09-01',
                endDate: '2025-06-30',
                isCurrent: true
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe(uniqueName);
    });

    it('should fetch academic years with valid token', async () => {
        const res = await request(app)
            .get('/academic/years')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
