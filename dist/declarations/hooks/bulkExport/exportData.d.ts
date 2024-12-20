import { ExportData } from "../../types/bulk/bulkOperations";
export declare function useExportData(props: ExportData): {
    exportData: () => Promise<void>;
    error: any;
};
