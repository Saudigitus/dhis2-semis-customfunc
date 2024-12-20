import { excelProps } from '../../../types/bulk/bulkOperations';
export declare function gererateFile({ unavailableDays }: {
    unavailableDays: (date: Date) => boolean;
}): {
    excelGenerator: (props: excelProps) => Promise<void>;
};
