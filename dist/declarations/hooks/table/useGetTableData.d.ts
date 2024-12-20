import { GetTableDataProps, TableDataProps } from "../../types/table/tableDataProps";
export declare function useTableData(): {
    getData: (tableDataProps: GetTableDataProps) => Promise<void>;
    tableData: TableDataProps[];
    loading: boolean;
};
