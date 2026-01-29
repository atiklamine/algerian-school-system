import { useState, useEffect, useCallback, useMemo } from 'react';
import { GridColDef, GridColumnResizeParams } from '@mui/x-data-grid';

/**
 * A hook to persist DataGrid column widths in localStorage.
 * @param storageKey Unique key for the grid (e.g., 'users', 'subjects')
 * @param initialColumns Initial column definitions
 */
export const useDataGridPersistence = (storageKey: string, initialColumns: GridColDef[]) => {
    const [savedWidths, setSavedWidths] = useState<Record<string, number>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load widths from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`grid_width_${storageKey}`);
        if (stored) {
            try {
                setSavedWidths(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse saved grid widths', e);
            }
        }
        setIsLoaded(true);
    }, [storageKey]);

    // Handle column resize
    const onColumnResize = useCallback((params: GridColumnResizeParams) => {
        setSavedWidths((prev) => {
            const next = { ...prev, [params.colDef.field]: params.width };
            localStorage.setItem(`grid_width_${storageKey}`, JSON.stringify(next));
            return next;
        });
    }, [storageKey]);

    // Memoize final column definitions with saved widths
    const columns = useMemo(() => {
        // Prevent layout jump by waiting until localStorage is read
        if (!isLoaded) return initialColumns;

        return initialColumns.map((col) => {
            if (savedWidths[col.field] !== undefined) {
                // If we have a saved width, use it and disable flex to ensure it's respected
                const { flex, ...rest } = col;
                return {
                    ...rest,
                    width: savedWidths[col.field],
                    // We keep original col properties but override width
                } as GridColDef;
            }
            return col;
        });
    }, [initialColumns, savedWidths, isLoaded]);

    return { columns, onColumnResize };
};
