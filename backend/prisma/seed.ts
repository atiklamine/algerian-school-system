import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean Database (optional but recommended for clean slate)
    // Be careful in production!
    await prisma.grade.deleteMany();
    await prisma.classSubject.deleteMany();
    await prisma.majorSubject.deleteMany();
    await prisma.user.deleteMany(); // Students & Teachers
    await prisma.class.deleteMany();
    await prisma.major.deleteMany();
    await prisma.level.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.academicYear.deleteMany();

    // 2. Academic Year
    const currentYear = await prisma.academicYear.create({
        data: {
            name: '2024-2025',
            startDate: new Date('2024-09-01'),
            endDate: new Date('2025-06-30'),
            isCurrent: true,
        },
    });

    // 2.5 Admin / Director
    const directorPassword = await bcrypt.hash('password123', 10);
    await prisma.user.create({
        data: {
            username: 'admin',
            email: 'director@school.dz',
            passwordHash: directorPassword,
            role: Role.Director
        }
    });

    console.log('👨‍💼 Created Director: admin (director@school.dz)');

    // 2.6 Administrator (Super Admin)
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            username: 'superadmin',
            email: 'admin@school.dz',
            passwordHash: adminPassword,
            role: Role.Administrator
        }
    });
    console.log('🛠️ Created Administrator: superadmin (admin@school.dz)');

    // 2.7 Manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    await prisma.user.create({
        data: {
            username: 'manager_1',
            email: 'manager@school.dz',
            passwordHash: managerPassword,
            role: Role.Manager
        }
    });
    console.log('📋 Created Manager: manager_1 (manager@school.dz)');

    // 3. Subjects (Algerian System)
    const subjectsData = [
        { code: 'MATH', nameAr: 'رياضيات', nameFr: 'Mathématiques' },
        { code: 'PHYS', nameAr: 'فيزياء', nameFr: 'Physique' },
        { code: 'SCI', nameAr: 'علوم طبيعية', nameFr: 'Sciences Naturelles' },
        { code: 'AR', nameAr: 'لغة عربية', nameFr: 'Langue Arabe' },
        { code: 'FR', nameAr: 'لغة فرنسية', nameFr: 'Français' },
        { code: 'ENG', nameAr: 'لغة إنجليزية', nameFr: 'Anglais' },
        { code: 'HIST_GEO', nameAr: 'تاريخ وجغرافيا', nameFr: 'Histoire Géo' },
        { code: 'ISLAMIC', nameAr: 'علوم إسلامية', nameFr: 'Sciences Islamiques' },
        { code: 'PHIL', nameAr: 'فلسفة', nameFr: 'Philosophie' },
        { code: 'TECH', nameAr: 'تكنولوجيا', nameFr: 'Technologie' },
        { code: 'SPORT', nameAr: 'تربية بدنية', nameFr: 'Sport' },
        { code: 'INFO', nameAr: 'إعلام آلي', nameFr: 'Informatique' },
    ];

    const subjects: Record<string, any> = {};
    for (const s of subjectsData) {
        subjects[s.code] = await prisma.subject.create({ data: s });
    }

    // 3.5 Create Teachers (One per subject for simplicity)
    const teachers: Record<string, any> = {};
    const teacherPassword = await bcrypt.hash('teacher123', 10);

    console.log('👩‍🏫 Creating teachers...');
    for (const sData of subjectsData) {
        const teacher = await prisma.user.create({
            data: {
                username: `teacher_${sData.code}`,
                email: `teacher_${sData.code}@school.dz`,
                passwordHash: teacherPassword,
                role: Role.Teacher
            }
        });
        teachers[sData.code] = teacher;
    }

    // 4. Levels & Majors with Coefficients
    const levelsData = [
        {
            name: '1AS',
            majors: [
                {
                    name: 'Science and Technology',
                    subjects: [
                        { code: 'MATH', coeff: 5 }, { code: 'PHYS', coeff: 4 }, { code: 'SCI', coeff: 4 },
                        { code: 'AR', coeff: 3 }, { code: 'FR', coeff: 2 }, { code: 'ENG', coeff: 2 },
                        { code: 'HIST_GEO', coeff: 2 }, { code: 'ISLAMIC', coeff: 2 }, { code: 'TECH', coeff: 2 },
                        { code: 'SPORT', coeff: 1 }, { code: 'INFO', coeff: 1 }
                    ]
                },
                // We could add TC Lettres if needed, but request implied mainly Sc/Math focus or generic 1AS
            ]
        },
        {
            name: '2AS',
            majors: [
                {
                    name: 'Sciences Expérimentales',
                    subjects: [
                        { code: 'MATH', coeff: 5 }, { code: 'PHYS', coeff: 5 }, { code: 'SCI', coeff: 6 },
                        { code: 'AR', coeff: 2 }, { code: 'FR', coeff: 2 }, { code: 'ENG', coeff: 2 },
                        { code: 'HIST_GEO', coeff: 2 }, { code: 'ISLAMIC', coeff: 2 }, { code: 'SPORT', coeff: 1 }
                    ]
                },
                {
                    name: 'Mathématiques',
                    subjects: [
                        { code: 'MATH', coeff: 7 }, { code: 'PHYS', coeff: 6 }, { code: 'SCI', coeff: 2 },
                        { code: 'AR', coeff: 2 }, { code: 'FR', coeff: 2 }, { code: 'ENG', coeff: 2 },
                        { code: 'HIST_GEO', coeff: 2 }, { code: 'ISLAMIC', coeff: 2 }, { code: 'SPORT', coeff: 1 }
                    ]
                }
            ]
        },
        {
            name: '3AS',
            majors: [
                {
                    name: 'Sciences Expérimentales',
                    subjects: [
                        { code: 'MATH', coeff: 5 }, { code: 'PHYS', coeff: 5 }, { code: 'SCI', coeff: 6 },
                        { code: 'AR', coeff: 3 }, { code: 'FR', coeff: 2 }, { code: 'ENG', coeff: 2 },
                        { code: 'HIST_GEO', coeff: 2 }, { code: 'ISLAMIC', coeff: 2 }, { code: 'PHIL', coeff: 2 }, { code: 'SPORT', coeff: 1 }
                    ]
                },
                {
                    name: 'Mathématiques',
                    subjects: [
                        { code: 'MATH', coeff: 7 }, { code: 'PHYS', coeff: 6 }, { code: 'SCI', coeff: 2 },
                        { code: 'AR', coeff: 3 }, { code: 'FR', coeff: 2 }, { code: 'ENG', coeff: 2 },
                        { code: 'HIST_GEO', coeff: 2 }, { code: 'ISLAMIC', coeff: 2 }, { code: 'PHIL', coeff: 2 }, { code: 'SPORT', coeff: 1 }
                    ]
                }
            ]
        }
    ];

    for (const lData of levelsData) {
        const level = await prisma.level.create({ data: { name: lData.name } });

        for (const mData of lData.majors) {
            const major = await prisma.major.create({
                data: {
                    name: mData.name,
                    levelId: level.id
                }
            });

            // Link Subjects to Major (MajorSubject)
            for (const sub of mData.subjects) {
                if (subjects[sub.code]) {
                    await prisma.majorSubject.create({
                        data: {
                            majorId: major.id,
                            subjectId: subjects[sub.code].id,
                            coefficient: sub.coeff
                        }
                    });
                }
            }

            // 5. Classes & 6. Students
            // Rule: create 5 classes per major as requested

            let classCount = 5;
            let suffixPrefix = "";

            if (lData.name === '1AS') {
                suffixPrefix = "S"; // Science/Shared for 1AS
            } else {
                if (mData.name.includes('Math')) suffixPrefix = "M";
                else if (mData.name.includes('Science')) suffixPrefix = "S";
            }

            for (let i = 1; i <= classCount; i++) {
                const className = lData.name === '1AS'
                    ? `${lData.name} ${i}`
                    : `${lData.name} ${suffixPrefix}${i}`;

                // Assign a random main teacher (or just the math teacher for simplicity)
                // Let's rotate main teachers based on class index
                const subjectCodes = Object.keys(teachers);
                const mainTeacherCode = subjectCodes[i % subjectCodes.length];
                const mainTeacher = teachers[mainTeacherCode];

                const cls = await prisma.class.create({
                    data: {
                        name: className,
                        majorId: major.id,
                        academicYearId: currentYear.id,
                        mainTeacherId: mainTeacher.id
                    }
                });

                // 6. Inherit Subjects to Class (ClassSubject) & Assign Teachers
                const majorSubjects = await prisma.majorSubject.findMany({
                    where: { majorId: major.id },
                    include: { subject: true }
                });

                for (const ms of majorSubjects) {
                    // Find the teacher for this subject
                    // ms.subject.code should match our teachers map keys
                    const subjectTeacher = teachers[ms.subject.code];

                    await prisma.classSubject.create({
                        data: {
                            classId: cls.id,
                            subjectId: ms.subjectId,
                            coefficient: ms.coefficient,
                            teacherId: subjectTeacher ? subjectTeacher.id : undefined
                        }
                    });
                }

                // 7. Seed Students (15 per class)
                const hashedPassword = await bcrypt.hash('student123', 10);

                for (let s = 1; s <= 15; s++) {
                    const studentNum = (i - 1) * 15 + s;
                    const uniqueSuffix = `${lData.name}_${suffixPrefix}_${i}_${s}`.replace(/\s/g, '');

                    await prisma.user.create({
                        data: {
                            username: `student_${uniqueSuffix}`,
                            email: `student_${uniqueSuffix}@school.dz`,
                            passwordHash: hashedPassword,
                            role: Role.Student,
                            classId: cls.id
                        }
                    });
                }

                console.log(`Created Class ${className} with Main Teacher ${mainTeacher.username}`);
            }
        }
    }

    // 8. Permissions & Role Assignments
    console.log('🛡️ Seeding Permissions...');
    const permissionsData = [
        // Users
        { code: 'user.create', category: 'users', nameEn: 'Create Users', nameFr: 'Créer des utilisateurs', nameAr: 'إنشاء مستخدمين' },
        { code: 'user.read', category: 'users', nameEn: 'View Users', nameFr: 'Voir les utilisateurs', nameAr: 'عرض المستخدمين' },
        { code: 'user.update', category: 'users', nameEn: 'Edit Users', nameFr: 'Modifier des utilisateurs', nameAr: 'تعديل المستخدمين' },
        { code: 'user.delete', category: 'users', nameEn: 'Delete Users', nameFr: 'Supprimer des utilisateurs', nameAr: 'حذف المستخدمين' },

        // Classes
        { code: 'class.create', category: 'classes', nameEn: 'Create Classes', nameFr: 'Créer des classes', nameAr: 'إنشاء فصول' },
        { code: 'class.read', category: 'classes', nameEn: 'View Classes', nameFr: 'Voir les classes', nameAr: 'عرض الفصول' },
        { code: 'class.update', category: 'classes', nameEn: 'Edit Classes', nameFr: 'Modifier des classes', nameAr: 'تعديل الفصول' },
        { code: 'class.delete', category: 'classes', nameEn: 'Delete Classes', nameFr: 'Supprimer des classes', nameAr: 'حذف الفصول' },

        // Subjects
        { code: 'subject.manage', category: 'subjects', nameEn: 'Manage Subjects', nameFr: 'Gérer les matières', nameAr: 'إدارة المواد' },

        // Grades
        { code: 'grade.enter', category: 'grades', nameEn: 'Enter Grades', nameFr: 'Saisir les notes', nameAr: 'إدخال العلامات' },
        { code: 'grade.view_all', category: 'grades', nameEn: 'View All Grades', nameFr: 'Voir toutes les notes', nameAr: 'عرض جميع العلامات' },

        // Settings
        // Student Features
        { code: 'student.grades.view', category: 'student', nameEn: 'View My Grades', nameFr: 'Voir mes notes', nameAr: 'عرض علاماتي' },
        { code: 'student.schedule.view', category: 'student', nameEn: 'View My Schedule', nameFr: 'Voir mon emploi du temps', nameAr: 'عرض التوقيت' },
        { code: 'student.bulletin.view', category: 'student', nameEn: 'View My Bulletins', nameFr: 'Voir mes bulletins', nameAr: 'عرض كشوف النقاط' },
    ];

    // Create Permissions
    for (const p of permissionsData) {
        await prisma.permission.upsert({
            where: { code: p.code },
            update: {},
            create: p
        });
    }

    // Default Role Assignments
    const rolePermissions: Record<string, string[]> = {
        [Role.Administrator]: permissionsData.map(p => p.code), // All permissions
        [Role.Director]: ['user.create', 'user.read', 'user.update', 'class.create', 'class.read', 'class.update', 'subject.manage', 'grade.view_all', 'settings.manage'],
        [Role.Manager]: ['user.read', 'class.read', 'grade.view_all'],
        [Role.Teacher]: ['class.read', 'grade.enter'],
        [Role.Student]: ['student.grades.view', 'student.schedule.view', 'student.bulletin.view']
    };

    for (const [role, codes] of Object.entries(rolePermissions)) {
        for (const code of codes) {
            const permission = await prisma.permission.findUnique({ where: { code } });
            if (permission) {
                await prisma.rolePermission.upsert({
                    where: {
                        role_permissionId: {
                            role: role as Role,
                            permissionId: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role: role as Role,
                        permissionId: permission.id
                    }
                });
            }
        }
    }

    console.log('✅ Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
