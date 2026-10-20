import { attendanceConfig } from "./FormatRowsDataTypes";

type TableDataProps = Record<string, string>;

interface GetTableDataProps {
    page?: number
    pageSize?: number
    program: string
    order?: string
    orgUnit: string
    baseProgramStage: string
    otherProgramStage?: string
    attributeFilters?: string[]
    dataElementFilters?: string[]
    occurredAfter?: string
    occurredBefore?: string
    attendanceConfig?: attendanceConfig
    paging?: boolean
    allowAttendanceStatus?:boolean
    // Filters for the attendance records only (class fields that the attendance stage has).
    attendanceDataElementFilters?: any[]
}

interface GetAttendanceDataProps {
    tei: string
    selectedDate: any
}

export type { TableDataProps, GetTableDataProps, GetAttendanceDataProps }