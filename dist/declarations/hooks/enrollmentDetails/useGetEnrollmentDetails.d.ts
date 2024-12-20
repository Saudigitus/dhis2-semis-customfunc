import { ExportData } from '../../types/bulk/bulkOperations';
export declare function useGetEnrollmentData(props: ExportData): {
    getEnrollmentDetails: (events: any) => Promise<any>;
    error: boolean;
};
