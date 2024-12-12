type TableDataProps = Record<string, string>;

interface GetTableDataProps {
    page?: number
    pageSize?: number
    program: string
    order?: string
    orgUnit: string
    baseProgramStage: string
    attributeFilters?: string[]
    dataElementFilters?: string[]
}

interface GetAttendanceDataProps {
    tei: string
    selectedDate: any
}

export type { TableDataProps, GetTableDataProps, GetAttendanceDataProps }