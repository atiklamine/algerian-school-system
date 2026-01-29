
import prisma from '../shared/prisma';
import { hashPassword } from '../shared/auth.utils';

async function main() {
    try {
        console.log('Starting structural seed...');

        const password = 'password123';
        const passwordHash = await hashPassword(password);

        // 1. Academic Year
        const academicYear = await prisma.academicYear.upsert({
            where: { id: 'current-year-id' },
            update: {},
            create: {
                id: 'current-year-id',
                name: '2024-2025',
                startDate: new Date('2024-09-01'),
                endDate: new Date('2025-06-30'),
                isCurrent: true,
            },
        });

        // 2. Subjects
        const subjectsData = [
            { code: 'MATH', nameAr: 'رياضيات', nameFr: 'Mathématiques' },
            { code: 'PHYS', nameAr: 'فيزياء', nameFr: 'Physique' },
            { code: 'ARAB', nameAr: 'لغة عربية', nameFr: 'Langue Arabe' },
            { code: 'FREN', nameAr: 'لغة فرنسية', nameFr: 'Langue Française' },
            { code: 'ENGL', nameAr: 'لغة إنجليزية', nameFr: 'Langue Anglaise' },
            { code: 'HIST', nameAr: 'تاريخ وجغرافيا', nameFr: 'Histoire-Géo' },
            { code: 'ISLM', nameAr: 'علوم إسلامية', nameFr: 'Sciences Islamiques' },
            { code: 'NATU', nameAr: 'علوم الطبيعة والحياة', nameFr: 'Sciences Naturelles' },
            { code: 'PHIL', nameAr: 'فلسفة', nameFr: 'Philosophie' },
        ];

        const subjects: any = {};
        for (const s of subjectsData) {
            subjects[s.code] = await prisma.subject.upsert({
                where: { code: s.code },
                update: s,
                create: s,
            });
        }

        // 3. Levels
        const levelsData = [
            { name: '1AS' },
            { name: '2AS' },
            { name: '3AS' },
        ];

        const levels: any = {};
        for (const l of levelsData) {
            levels[l.name] = await prisma.level.upsert({
                where: { name: l.name },
                update: {},
                create: l,
            });
        }

        // 4. Majors & MajorSubjects (Coefficients)
        const majorsData = [
            {
                level: '1AS',
                name: 'Tronc Commun Sciences',
                subs: [
                    { code: 'MATH', coeff: 5 }, { code: 'PHYS', coeff: 4 }, { code: 'NATU', coeff: 4 },
                    { code: 'ARAB', coeff: 3 }, { code: 'FREN', coeff: 2 }, { code: 'ENGL', coeff: 2 }
                ]
            },
            {
                level: '1AS',
                name: 'Tronc Commun Lettres',
                subs: [
                    { code: 'MATH', coeff: 2 }, { code: 'ARAB', coeff: 5 }, { code: 'FREN', coeff: 3 },
                    { code: 'ENGL', coeff: 3 }, { code: 'HIST', coeff: 3 }
                ]
            },
            {
                level: '2AS',
                name: 'Sciences Expérimentales',
                subs: [
                    { code: 'MATH', coeff: 5 }, { code: 'PHYS', coeff: 5 }, { code: 'NATU', coeff: 6 },
                    { code: 'ARAB', coeff: 2 }, { code: 'ISLM', coeff: 2 }
                ]
            },
            {
                level: '2AS',
                name: 'Mathématiques',
                subs: [
                    { code: 'MATH', coeff: 7 }, { code: 'PHYS', coeff: 6 }, { code: 'NATU', coeff: 2 },
                    { code: 'ARAB', coeff: 2 }, { code: 'PHIL', coeff: 2 }
                ]
            }
        ];

        for (const m of majorsData) {
            const major = await prisma.major.upsert({
                where: { name_levelId: { name: m.name, levelId: levels[m.level].id } },
                update: {},
                create: {
                    name: m.name,
                    levelId: levels[m.level].id,
                },
            });

            for (const sub of m.subs) {
                await prisma.majorSubject.upsert({
                    where: { majorId_subjectId: { majorId: major.id, subjectId: subjects[sub.code].id } },
                    update: { coefficient: sub.coeff },
                    create: {
                        majorId: major.id,
                        subjectId: subjects[sub.code].id,
                        coefficient: sub.coeff,
                    },
                });
            }

            // Create a default class for this major
            await prisma.class.create({
                data: {
                    name: `${m.name.split(' ').map(w => w[0]).join('').toUpperCase()}-1`,
                    majorId: major.id,
                    academicYearId: academicYear.id,
                }
            });
        }

        // 5. Default Users
        await prisma.user.upsert({
            where: { email: 'admin@school.dz' },
            update: {},
            create: {
                email: 'admin@school.dz',
                username: 'admin',
                passwordHash,
                role: 'Director',
            },
        });

        await prisma.user.upsert({
            where: { email: 'teacher@school.dz' },
            update: {},
            create: {
                email: 'teacher@school.dz',
                username: 'teacher',
                passwordHash,
                role: 'Teacher',
            },
        });

        console.log('Seed completed successfully.');
    } catch (e) {
        console.error('Error seeding:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
