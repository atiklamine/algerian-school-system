import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugYearsAndClasses() {
    console.log('--- Debugging Academic Years ---');
    const years = await prisma.academicYear.findMany();
    years.forEach(y => {
        console.log(`Year: ${y.name}, ID: ${y.id}, isCurrent: ${y.isCurrent}`);
    });

    console.log('\n--- Debugging Classes ---');
    const classes = await prisma.class.findMany({
        include: { academicYear: true }
    });
    console.log(`Total Classes: ${classes.length}`);
    if (classes.length > 0) {
        const classesByYear: any = {};
        classes.forEach(c => {
            const yearName = c.academicYear?.name || 'No Year';
            classesByYear[yearName] = (classesByYear[yearName] || 0) + 1;
        });
        console.log('Classes by Year:');
        console.log(JSON.stringify(classesByYear, null, 2));
    }

    await prisma.$disconnect();
}

debugYearsAndClasses();
