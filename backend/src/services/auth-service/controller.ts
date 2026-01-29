import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { hashPassword, comparePassword, generateTokens } from '../../shared/auth.utils';
import { sendResponse } from '../../shared/response.utils';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password, deviceInfo } = req.body;

        // Log login attempt with device information
        const attemptInfo = {
            email,
            timestamp: new Date().toISOString(),
            ip: req.ip || req.connection.remoteAddress,
            ...deviceInfo
        };

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.passwordHash))) {
            // Log failed login attempt
            console.log('\n❌ ==================== FAILED LOGIN ATTEMPT ====================');
            console.log('📧 Email:', attemptInfo.email);
            console.log('🌐 IP Address:', attemptInfo.ip);
            console.log('📱 Device:', attemptInfo.deviceType || 'Unknown');
            console.log('🖥️  Browser:', attemptInfo.browser || 'Unknown');
            console.log('📐 Screen:', attemptInfo.screenResolution || 'Unknown');
            console.log('🕐 Time:', attemptInfo.timestamp);
            console.log('===============================================================\n');
            return sendResponse(res, 401, false, undefined, 'Invalid credentials');
        }

        // Log successful login
        console.log('\n✅ ==================== SUCCESSFUL LOGIN ====================');
        console.log('📧 Email:', attemptInfo.email);
        console.log('👤 User:', user.username);
        console.log('🎭 Role:', user.role);
        console.log('🌐 IP Address:', attemptInfo.ip);
        console.log('📱 Device:', attemptInfo.deviceType || 'Unknown');
        console.log('🖥️  Browser:', attemptInfo.browser || 'Unknown');
        console.log('📐 Screen:', attemptInfo.screenResolution || 'Unknown');
        console.log('🕐 Time:', attemptInfo.timestamp);
        console.log('============================================================\n');

        // Fetch user permissions
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { role: user.role },
            include: { permission: true }
        });
        const permissions = rolePermissions.map(rp => rp.permission.code);

        const tokens = generateTokens(user.id, user.role);
        sendResponse(res, 200, true, {
            ...tokens,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                permissions
            }
        }, 'Login successful');
    } catch (error) {
        console.error('Login error:', error);
        sendResponse(res, 500, false, undefined, 'Internal server error');
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;

        const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { username }] } });
        if (existingUser) {
            return sendResponse(res, 409, false, undefined, 'User already exists');
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role, // Role is now validated by Zod
            },
        });

        sendResponse(res, 201, true, { userId: user.id }, 'User registered successfully');
    } catch (error) {
        console.error('Register error:', error);
        sendResponse(res, 500, false, undefined, 'Internal server error');
    }
};
