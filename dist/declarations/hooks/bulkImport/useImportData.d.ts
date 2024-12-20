import { importData } from "../../types/bulk/bulkOperations";
export declare function useImportData(): {
    importData: (props: importData) => Promise<void>;
    stats: any;
};
