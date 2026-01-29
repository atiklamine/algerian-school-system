import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const router = express.Router();

// Service URLs (should be in env vars)
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const ACADEMIC_SERVICE_URL = process.env.ACADEMIC_SERVICE_URL || 'http://localhost:3002';

router.use('/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));
router.use('/academic', createProxyMiddleware({ target: ACADEMIC_SERVICE_URL, changeOrigin: true }));

export default router;
