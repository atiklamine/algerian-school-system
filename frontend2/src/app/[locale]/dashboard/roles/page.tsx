'use client';
import { useState, useEffect, useCallback, memo, Fragment } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Checkbox, CircularProgress, Chip, Alert } from '@mui/material';
import { api } from '@/lib/api';
import SecurityIcon from '@mui/icons-material/Security';

// Memoized Row Component to prevent full table re-renders
const PermissionRow = memo(({ permission, roles, matrix, onToggle }: {
    permission: any,
    roles: string[],
    matrix: Record<string, string[]>,
    onToggle: (role: string, permissionCode: string, currentStatus: boolean) => void
}) => {
    return (
        <TableRow hover>
            <TableCell sx={{ position: 'sticky', left: 0, bgcolor: 'background.paper', zIndex: 10, borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                <Typography variant="body2" fontWeight="medium">{permission.nameEn}</Typography>
                <Typography variant="caption" color="text.secondary">{permission.description || permission.nameFr}</Typography>
            </TableCell>
            {roles.map(role => {
                const isEnabled = matrix[role]?.includes(permission.code) || false;
                const isAdmin = role === 'Administrator';
                // Admin always true
                const checked = isAdmin || isEnabled;

                return (
                    <TableCell key={`${role}-${permission.code}`} align="center">
                        <Checkbox
                            checked={checked}
                            disabled={isAdmin}
                            onChange={() => onToggle(role, permission.code, isEnabled)}
                            color="primary"
                        />
                    </TableCell>
                );
            })}
        </TableRow>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function for performance
    // Only re-render if the matrix values relevant to THIS permission have changed
    // This is the critical optimization.
    const prevMatrix = prevProps.matrix;
    const nextMatrix = nextProps.matrix;

    // If permission or roles changed (unlikely), re-render
    if (prevProps.permission.code !== nextProps.permission.code) return false;

    // Check if the permission status for any role has changed for THIS specific permission
    for (const role of nextProps.roles) {
        const prevHas = prevMatrix[role]?.includes(prevProps.permission.code);
        const nextHas = nextMatrix[role]?.includes(nextProps.permission.code);
        if (prevHas !== nextHas) return false; // Re-render if status changed
    }

    return true; // No relevant changes, skip render
});

PermissionRow.displayName = 'PermissionRow';

export default function RolesPage() {
    const [matrix, setMatrix] = useState<Record<string, string[]>>({});
    const [permissions, setPermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Group permissions
    const groupedPermissions: Record<string, any[]> = {};
    permissions.forEach(p => {
        if (!groupedPermissions[p.category]) groupedPermissions[p.category] = [];
        groupedPermissions[p.category].push(p);
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [permRes, matrixRes] = await Promise.all([
                api.get('/roles/permissions'),
                api.get('/roles/matrix')
            ]);
            setPermissions(permRes.data.data);
            setMatrix(matrixRes.data.data);
        } catch (err: any) {
            console.error(err);
            setError('Failed to load roles data.');
        } finally {
            setLoading(false);
        }
    };

    const roles = ['Administrator', 'Director', 'Manager', 'Teacher', 'Student'];

    // Stabilize the handler
    const handleToggle = useCallback(async (role: string, permissionCode: string, currentStatus: boolean) => {
        // Optimistic update
        setMatrix(prev => {
            const newMatrix = { ...prev };
            if (currentStatus) {
                newMatrix[role] = newMatrix[role].filter(c => c !== permissionCode);
            } else {
                newMatrix[role] = [...(newMatrix[role] || []), permissionCode];
            }
            return newMatrix;
        });

        try {
            await api.post('/roles/matrix', {
                role,
                permissionCode,
                enabled: !currentStatus
            });
        } catch (error) {
            console.error('Failed to update permission', error);
            // We should revert here in a real robust app, fetching data again is easiest to simplify logic
            fetchData();
            alert('Failed to save change');
        }
    }, []);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SecurityIcon sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold">Roles & Permissions</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage access control for all system roles.
                    </Typography>
                </Box>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
                <TableContainer sx={{ maxHeight: '75vh' }}>
                    <Table stickyHeader sx={{ minWidth: 800 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: 'background.default', position: 'sticky', left: 0, zIndex: 11, minWidth: 200 }}>Category / Permission</TableCell>
                                {roles.map(role => (
                                    <TableCell key={role} align="center" sx={{ fontWeight: 'bold', bgcolor: 'background.default' }}>
                                        <Chip
                                            label={role}
                                            color={role === 'Administrator' ? 'error' : role === 'Director' ? 'warning' : 'primary'}
                                            variant={role === 'Student' ? 'outlined' : 'filled'}
                                            size="small"
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <Fragment key={category}>
                                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                                        <TableCell colSpan={roles.length + 1} sx={{ position: 'sticky', left: 0, zIndex: 10, bgcolor: 'action.hover' }}>
                                            <Typography variant="subtitle2" fontWeight="bold" sx={{ textTransform: 'capitalize' }}>
                                                {category}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                    {perms.map((perm) => (
                                        <PermissionRow
                                            key={perm.id}
                                            permission={perm}
                                            roles={roles}
                                            matrix={matrix}
                                            onToggle={handleToggle}
                                        />
                                    ))}
                                </Fragment>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
