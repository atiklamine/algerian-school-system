import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import academicRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.ACADEMIC_SERVICE_PORT || 3002;

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/academic', academicRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'academic-service' });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Academic Service running on port ${PORT}`);
    });
}

export default app;
