import { importData } from "../../../types/bulk/bulkOperations";
import { DataStoreRecord } from "../../../types/dataStore/DataStoreConfig";
export declare function postEnrollmentData({ setStats }: {
    setStats: any;
}): {
    postEnrollments: (enrollments: any[], excelData: any, importMode: importData["importMode"], program: string, updating: boolean, dataStore: DataStoreRecord, orgUnit: string) => Promise<void>;
};
