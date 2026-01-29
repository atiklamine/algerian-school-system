import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed default permissions for Algerian school system
 * Based on typical roles: Director (مدير), Teacher (أستاذ), Student (تلميذ)
 */

const permissions = [
    // User Management
    {
        code: 'manage_users',
        nameEn: 'Manage Users',
        nameAr: 'إدارة المستخدمين',
        nameFr: 'Gérer les utilisateurs',
        category: 'users',
        description: 'Create, edit, and delete users'
    },
    {
        code: 'view_users',
        nameEn: 'View Users',
        nameAr: 'عرض المستخدمين',
        nameFr: 'Voir les utilisateurs',
        category: 'users',
        description: 'View user list and details'
    },

    // Class Management
    {
        code: 'manage_classes',
        nameEn: 'Manage All Classes',
        nameAr: 'إدارة جميع الأقسام',
        nameFr: 'Gérer toutes les classes',
        category: 'classes',
        description: 'Create, edit, and delete any class'
    },
    {
        code: 'manage_own_classes',
        nameEn: 'Manage Own Classes',
        nameAr: 'إدارة الأقسام الخاصة',
        nameFr: 'Gérer ses propres classes',
        category: 'classes',
        description: 'Manage only assigned classes'
    },
    {
        code: 'view_classes',
        nameEn: 'View Classes',
        nameAr: 'عرض الأقسام',
        nameFr: 'Voir les classes',
        category: 'classes',
        description: 'View class information'
    },

    // Subject Management
    {
        code: 'manage_subjects',
        nameEn: 'Manage Subjects',
        nameAr: 'إدارة المواد',
        nameFr: 'Gérer les matières',
        category: 'subjects',
        description: 'Create, edit, and delete subjects'
    },
    {
        code: 'view_subjects',
        nameEn: 'View Subjects',
        nameAr: 'عرض المواد',
        nameFr: 'Voir les matières',
        category: 'subjects',
        description: 'View subject information'
    },

    // Grade Management
    {
        code: 'enter_grades',
        nameEn: 'Enter Grades',
        nameAr: 'إدخال العلامات',
        nameFr: 'Saisir les notes',
        category: 'grades',
        description: 'Enter and edit grades for students'
    },
    {
        code: 'view_all_grades',
        nameEn: 'View All Grades',
        nameAr: 'عرض جميع العلامات',
        nameFr: 'Voir toutes les notes',
        category: 'grades',
        description: 'View grades for all students'
    },
    {
        code: 'view_own_grades',
        nameEn: 'View Own Grades',
        nameAr: 'عرض العلامات الخاصة',
        nameFr: 'Voir ses propres notes',
        category: 'grades',
        description: 'View only own grades'
    },

    // Bulletin Management
    {
        code: 'generate_bulletins',
        nameEn: 'Generate Bulletins',
        nameAr: 'إنشاء الكشوف',
        nameFr: 'Générer les bulletins',
        category: 'bulletins',
        description: 'Generate term bulletins'
    },
    {
        code: 'view_all_bulletins',
        nameEn: 'View All Bulletins',
        nameAr: 'عرض جميع الكشوف',
        nameFr: 'Voir tous les bulletins',
        category: 'bulletins',
        description: 'View bulletins for all students'
    },
    {
        code: 'view_own_bulletin',
        nameEn: 'View Own Bulletin',
        nameAr: 'عرض الكشف الخاص',
        nameFr: 'Voir son propre bulletin',
        category: 'bulletins',
        description: 'View only own bulletin'
    },

    // Student Management
    {
        code: 'manage_students',
        nameEn: 'Manage Students',
        nameAr: 'إدارة التلاميذ',
        nameFr: 'Gérer les élèves',
        category: 'students',
        description: 'Create, edit, and delete students'
    },
    {
        code: 'view_students',
        nameEn: 'View Students',
        nameAr: 'عرض التلاميذ',
        nameFr: 'Voir les élèves',
        category: 'students',
        description: 'View student information'
    },

    // Settings Management
    {
        code: 'manage_settings',
        nameEn: 'Manage Settings',
        nameAr: 'إدارة الإعدادات',
        nameFr: 'Gérer les paramètres',
        category: 'settings',
        description: 'Manage system settings, exam types, periods'
    },
    {
        code: 'manage_permissions',
        nameEn: 'Manage Permissions',
        nameAr: 'إدارة الصلاحيات',
        nameFr: 'Gérer les permissions',
        category: 'settings',
        description: 'Manage role permissions'
    },

    // Profile Management
    {
        code: 'view_own_profile',
        nameEn: 'View Own Profile',
        nameAr: 'عرض الملف الشخصي',
        nameFr: 'Voir son profil',
        category: 'profile',
        description: 'View own profile information'
    },
    {
        code: 'edit_own_profile',
        nameEn: 'Edit Own Profile',
        nameAr: 'تعديل الملف الشخصي',
        nameFr: 'Modifier son profil',
        category: 'profile',
        description: 'Edit own profile information'
    }
];

// Default role permissions for Algerian school system
const rolePermissions = {
    [Role.Director]: [
        // Directors have all permissions
        'manage_users', 'view_users',
        'manage_classes', 'view_classes',
        'manage_subjects', 'view_subjects',
        'enter_grades', 'view_all_grades',
        'generate_bulletins', 'view_all_bulletins',
        'manage_students', 'view_students',
        'manage_settings', 'manage_permissions',
        'view_own_profile', 'edit_own_profile'
    ],
    [Role.Teacher]: [
        // Teachers can manage their own classes and enter grades
        'view_users',
        'manage_own_classes', 'view_classes',
        'view_subjects',
        'enter_grades', 'view_all_grades',
        'view_all_bulletins',
        'view_students',
        'view_own_profile', 'edit_own_profile'
    ],
    [Role.Student]: [
        // Students can only view their own information
        'view_own_grades',
        'view_own_bulletin',
        'view_own_profile', 'edit_own_profile'
    ]
};

async function seedPermissions() {
    console.log('🌱 Seeding permissions for Algerian school system...\n');

    try {
        // Create all permissions
        console.log('📝 Creating permissions...');
        for (const perm of permissions) {
            await prisma.permission.upsert({
                where: { code: perm.code },
                update: perm,
                create: perm
            });
            console.log(`  ✓ ${perm.code} (${perm.nameAr})`);
        }

        console.log('\n🔐 Assigning permissions to roles...');

        // Assign permissions to roles
        for (const [role, permCodes] of Object.entries(rolePermissions)) {
            console.log(`\n  ${role}:`);

            for (const permCode of permCodes) {
                const permission = await prisma.permission.findUnique({
                    where: { code: permCode }
                });

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
                    console.log(`    ✓ ${permCode}`);
                }
            }
        }

        console.log('\n✅ Permission seeding completed successfully!\n');

        // Display summary
        const permCount = await prisma.permission.count();
        const directorPerms = await prisma.rolePermission.count({ where: { role: Role.Director } });
        const teacherPerms = await prisma.rolePermission.count({ where: { role: Role.Teacher } });
        const studentPerms = await prisma.rolePermission.count({ where: { role: Role.Student } });

        console.log('📊 Summary:');
        console.log(`  Total Permissions: ${permCount}`);
        console.log(`  Director Permissions: ${directorPerms}`);
        console.log(`  Teacher Permissions: ${teacherPerms}`);
        console.log(`  Student Permissions: ${studentPerms}`);

    } catch (error) {
        console.error('❌ Error seeding permissions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedPermissions()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
