import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function distributeStudents() {
    console.log('🔄 Distributing students to classes...');

    // Get all classes
    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }
    });

    // Get all students (not already assigned)
    const students = await prisma.user.findMany({
        where: {
            role: 'Student',
            classId: null
        },
        orderBy: { email: 'asc' }
    });

    console.log(`Found ${classes.length} classes`);
    console.log(`Found ${students.length} unassigned students`);

    if (students.length === 0) {
        console.log('✅ All students already assigned!');
        const assignedStudents = await prisma.user.findMany({
            where: { role: 'Student', classId: { not: null } },
            include: { class: true }
        });

        // Show distribution
        const distribution: any = {};
        assignedStudents.forEach(s => {
            const className = s.class?.name || 'Unassigned';
            distribution[className] = (distribution[className] || 0) + 1;
        });

        console.log('\n📊 Current Distribution:');
        Object.keys(distribution).sort().forEach(className => {
            console.log(`   ${className}: ${distribution[className]} students`);
        });

        await prisma.$disconnect();
        return;
    }

    // Distribute evenly (15 per class)
    let studentIndex = 0;
    for (const cls of classes) {
        const studentsToAssign = students.slice(studentIndex, studentIndex + 15);

        for (const student of studentsToAssign) {
            await prisma.user.update({
                where: { id: student.id },
                data: { classId: cls.id }
            });
        }

        console.log(`✓ Assigned ${studentsToAssign.length} students to ${cls.name}`);
        studentIndex += 15;
    }

    console.log('\n✅ Distribution complete!');

    // Verify
    const finalCheck = await prisma.user.findMany({
        where: { role: 'Student' },
        include: { class: true }
    });

    const distribution: any = {};
    finalCheck.forEach(s => {
        const className = s.class?.name || 'Unassigned';
        distribution[className] = (distribution[className] || 0) + 1;
    });

    console.log('\n📊 Final Distribution:');
    Object.keys(distribution).sort().forEach(className => {
        console.log(`   ${className}: ${distribution[className]} students`);
    });

    await prisma.$disconnect();
}

distributeStudents()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    });
