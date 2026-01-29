import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
    console.log('--- Checking DB Stats ---');
    const yearCount = await prisma.academicYear.count();
    const classCount = await prisma.class.count();
    const subjectCount = await prisma.subject.count();
    const studentCount = await prisma.user.count({ where: { role: 'Student' } });
    const teacherCount = await prisma.user.count({ where: { role: 'Teacher' } });
    const linkCount = await prisma.classSubject.count();

    console.log(`Academic Years: ${yearCount}`);
    console.log(`Classes: ${classCount}`);
    console.log(`Subjects: ${subjectCount}`);
    console.log(`Students: ${studentCount}`);
    console.log(`Teachers: ${teacherCount}`);
    console.log(`Class-Subject Links: ${linkCount}`);

    if (classCount > 0) {
        const firstClass = await prisma.class.findFirst({
            include: { academicYear: true, students: true }
        });
        console.log('\n--- First Class Sample ---');
        console.log(`Name: ${firstClass?.name}`);
        console.log(`Level: ${firstClass?.level}`);
        console.log(`Year: ${firstClass?.academicYear?.name}`);
        console.log(`Students: ${firstClass?.students.length}`);
    }

    await prisma.$disconnect();
}

checkDb();
