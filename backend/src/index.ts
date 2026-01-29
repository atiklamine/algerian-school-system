import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

if (missingEnvVars.length > 0) {
    console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet());
app.use(express.json());

import authRoutes from './services/auth-service/routes';
import academicRoutes from './services/academic-service/routes';
import userRoutes from './services/user-service/routes';
import roleRoutes from './services/role-service/routes';

app.use('/auth', authRoutes);
app.use('/academic', academicRoutes);
app.use('/users', userRoutes);
app.use('/roles', roleRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

import os from 'os';

app.listen(PORT, HOST, () => {
    const interfaces = os.networkInterfaces();
    const networkInfo: string[] = [];

    Object.keys(interfaces).forEach((ifname) => {
        interfaces[ifname]?.forEach((iface) => {
            if ('IPv4' !== iface.family || iface.internal !== false) {
                return;
            }
            networkInfo.push(`http://${iface.address}:${PORT}`);
        });
    });

    console.log(`Server running on ${HOST}:${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
    if (networkInfo.length > 0) {
        console.log('Network access ready:');
        networkInfo.forEach(url => console.log(`   - ${url}`));
    }
});
