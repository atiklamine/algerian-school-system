import * as XLSX from 'xlsx';

/**
 * Utility to handle symmetric Excel Import/Export
 */
export const excelUtil = {
    /**
     * Export data to Excel file
     * @param data Array of objects to export
     * @param filename Extensionless filename
     * @param sheetName Name of the sheet
     */
    export: (data: any[], filename: string, sheetName: string = "Data") => {
        if (!data || data.length === 0) return;

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    },

    /**
     * Import data from Excel file
     * @param file File object from input
     * @param callback Function called with parsed array of objects
     */
    import: (file: File, callback: (data: any[]) => void) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const bstr = event.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json<any>(ws);
                callback(data);
            } catch (error) {
                console.error("Excel Parse Error:", error);
                alert("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
            }
        };
        reader.readAsBinaryString(file);
    },

    /**
     * Map Excel keys to database keys
     * @param data Raw data from import
     * @param mappings Object mapping Excel Column Name -> Database Key
     */
    mapData: (data: any[], mappings: Record<string, string>) => {
        return data.map(item => {
            const mappedItem: any = {};
            for (const [excelKey, dbKey] of Object.entries(mappings)) {
                // Try to find the value by excelKey or dbKey (case insensitive)
                const value = item[excelKey] || item[dbKey] ||
                    item[excelKey.toLowerCase()] ||
                    item[dbKey.toLowerCase()];
                if (value !== undefined) {
                    mappedItem[dbKey] = value;
                }
            }
            return mappedItem;
        });
    }
};
