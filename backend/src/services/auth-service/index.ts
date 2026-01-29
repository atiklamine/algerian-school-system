import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Auth Service running on port ${PORT}`);
    });
}

export default app;
