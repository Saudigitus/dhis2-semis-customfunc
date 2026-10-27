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
    // Keeps only the events registered at this org unit. The orgUnit filter of the server applies to the
    // tracked entity owner, which changes after a transfer, so the events are read for every accessible
    // org unit and filtered here (e.g. the Outgoing transfers of a school).
    eventOrgUnit?: string
}

interface GetAttendanceDataProps {
    tei: string
    selectedDate: any
}

export type { TableDataProps, GetTableDataProps, GetAttendanceDataProps }