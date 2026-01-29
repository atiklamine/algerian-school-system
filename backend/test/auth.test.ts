import request from 'supertest';
import express from 'express';
import authRoutes from '../src/services/auth-service/routes';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
const prisma = new PrismaClient();

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

// Helper to clear db
async function clearDb() {
    await prisma.user.deleteMany({ where: { email: { contains: 'test' } } });
}

beforeAll(async () => {
    // Connect to test db or setup
});

afterAll(async () => {
    await prisma.$disconnect();
});

describe('Auth Endpoints', () => {

    // We mock the controller logic or relying on the real one?
    // Since this is integration test, we should use real app structure.
    // However, basic unit test for validation is enough here or we need to start the full app.
    // For now, let's assuming we are testing the router logic which includes validation.
    // But since the controller imports prisma directly, we need to mock prisma or use a test db.
    // Using a real DB for integration tests is best practice in "Best" apps, usually provided by Docker.
    // Currently we use dev.db (sqlite).

    it('should fail validation on invalid email', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                username: 'testu',
                email: 'invalid-email',
                password: 'password123',
                role: 'Student'
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Validation failed');
    });

    it('should fail validation on short password', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: '123'
            });

        expect(res.status).toBe(400);
    });

    it('should pass validation with valid data (mock controller execution)', async () => {
        // The controller will try to query DB. We expect it to proceed past validation.
        // If generic error (500) or 401/404 comes back, it means validation passed.
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'test@example.com',
                password: 'password123'
            });

        // 401 means Invalid credentials (controller reached)
        // 500 means DB error (controller reached)
        // 400 would mean validation failed
        expect(res.status).not.toBe(400);
    });
});
