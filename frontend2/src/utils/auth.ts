export const getUserRole = (): string | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('accessToken');
    if (!token) return null;

    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded.role || null;
    } catch (e) {
        console.error('Error decoding token:', e);
        return null;
    }
};

export const saveUserPermissions = (permissions: string[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('userPermissions', JSON.stringify(permissions));
};

export const getUserPermissions = (): string[] => {
    if (typeof window === 'undefined') return [];
    const perms = localStorage.getItem('userPermissions');
    if (!perms) return [];
    try {
        return JSON.parse(perms);
    } catch {
        return [];
    }
};

export const hasPermission = (requiredPermission: string): boolean => {
    const permissions = getUserPermissions();
    // Admin always has all permissions (client-side convenience, backend still checks)
    const role = getUserRole();
    if (role === 'Administrator') return true;

    return permissions.includes(requiredPermission);
};
