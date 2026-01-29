import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Starting verification...');

    // 1. Check Academic Years
    const years = await prisma.academicYear.findMany();
    console.log(`\n📅 Academic Years Found: ${years.length}`);
    years.forEach(y => console.log(`   - ${y.name} (Active: ${y.isCurrent})`));

    const activeYears = years.filter(y => y.isCurrent);
    if (activeYears.length !== 1) {
        console.error(`❌ ERROR: Expected 1 active year, found ${activeYears.length}`);
    } else {
        console.log('✅ Single active year verification passed.');
    }

    // 2. Check Levels & Majors
    const levels = await prisma.level.findMany({ include: { majors: true } });
    console.log(`\n📚 Levels Found: ${levels.length}`);
    levels.forEach(l => {
        console.log(`   - ${l.name}: ${l.majors.length} Majors (${l.majors.map(m => m.name).join(', ')})`);
    });

    // 3. Check Classes & Students
    const classes = await prisma.class.findMany({
        include: {
            _count: {
                select: { students: true, subjects: true }
            },
            major: true
        }
    });

    console.log(`\n🏫 Classes Found: ${classes.length}`);
    classes.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
        console.log(`   - [${c.major.name}] ${c.name}: ${c._count.students} Students, ${c._count.subjects} Subjects`);
        if (c._count.students !== 15) console.warn(`     ⚠️ Warning: Expected 15 students, found ${c._count.students}`);
    });

    // 4. Check Subjects
    const subjects = await prisma.subject.findMany();
    console.log(`\n📖 Total Subjects: ${subjects.length}`);

    // 5. Check Teachers
    const teachers = await prisma.user.findMany({ where: { role: 'Teacher' } });
    console.log(`\n👩‍🏫 Teachers Found: ${teachers.length}`);
    if (teachers.length === 0) console.warn('     ⚠️ Warning: No teachers found!');
    else console.log(`   - Examples: ${teachers.slice(0, 3).map(t => t.username).join(', ')}...`);

    // 6. Check Class Assignments
    const classesWithTeachers = await prisma.class.findMany({
        where: { mainTeacherId: { not: null } },
        include: { mainTeacher: true }
    });
    console.log(`\n🏫 Classes with Main Teacher: ${classesWithTeachers.length}/${classes.length}`);

    // 7. Check Class Subject Assignments
    const classSubjectsWithTeacher = await prisma.classSubject.count({
        where: { teacherId: { not: null } }
    });
    const totalClassSubjects = await prisma.classSubject.count();
    console.log(`\n📚 Class Subjects with Teacher Assigned: ${classSubjectsWithTeacher}/${totalClassSubjects}`);

    // 8. Check Director
    const directors = await prisma.user.findMany({ where: { role: 'Director' } });
    console.log(`\n👨‍💼 Directors Found: ${directors.length}`);
    if (directors.length === 0) console.error('     ❌ Error: No Director found!');
    else console.log(`   - Found: ${directors[0].username} (${directors[0].email})`);
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
