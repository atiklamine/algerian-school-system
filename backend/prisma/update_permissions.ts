import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Updating Permissions Only...');

    const permissionsData = [
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
        console.log(` - Upserted permission: ${p.code}`);
    }

    // Assign to Student Role
    const rolePermissions: Record<string, string[]> = {
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
                console.log(` - Assigned ${code} to ${role}`);
            }
        }
    }

    console.log('✅ Permissions updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
