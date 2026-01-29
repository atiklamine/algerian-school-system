import prisma from '../shared/prisma';
import { hashPassword } from '../shared/auth.utils';

async function main() {
    try {
        console.log('Starting seed...');

        const password = 'password123';
        const passwordHash = await hashPassword(password);

        // Create Admin (Director)
        const adminEmail = 'director@school.dz';
        const admin = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {},
            create: {
                username: 'admin',
                email: adminEmail,
                passwordHash,
                role: 'Director',
            },
        });
        console.log(`Created user: ${admin.email} (Role: ${admin.role})`);

        // Create Teacher
        const teacherEmail = 'teacher@school.dz';
        const teacher = await prisma.user.upsert({
            where: { email: teacherEmail },
            update: {},
            create: {
                username: 'teacher',
                email: teacherEmail,
                passwordHash,
                role: 'Teacher',
            },
        });
        console.log(`Created user: ${teacher.email} (Role: ${teacher.role})`);

        // Create Student
        const studentEmail = 'student@school.dz';
        const student = await prisma.user.upsert({
            where: { email: studentEmail },
            update: {},
            create: {
                username: 'student',
                email: studentEmail,
                passwordHash,
                role: 'Student',
            },
        });
        console.log(`Created user: ${student.email} (Role: ${student.role})`);

        console.log('Seed completed successfully.');
    } catch (e) {
        console.error('Error seeding users:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
