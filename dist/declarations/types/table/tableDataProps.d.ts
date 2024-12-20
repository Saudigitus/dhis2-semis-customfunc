type TableDataProps = Record<string, string>;
interface GetTableDataProps {
    page?: number;
    pageSize?: number;
    program: string;
    order?: string;
    orgUnit: string;
    baseProgramStage: string;
    secondaryProgramStages?: string[];
    attributeFilters?: string[];
    dataElementFilters?: string[];
    showAlert: (arg: any) => void;
    hideAlert: () => void;
}
export type { TableDataProps, GetTableDataProps };
