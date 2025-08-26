import { DataValuesProps } from "../api/WithoutRegistrationTypes"

export interface AttendanceFormaterProps {
    dataValues: DataValuesProps[]
    occurredAt: string
    trackedEntity: string
    event: string
}
interface defaults {
    currentAcademicYear: string
}

interface ClassPeriodType {
    key: string
    description: string
    endDate: string
    startDate: string
}

interface HolidayType {
    date: Date
    event: string
    type: string
}

interface schoolCalendar {
    id: string
    key: string
    defaults: defaults
    academicYear: {
        "endDate": string
        "startDate": string
        "code": string
        "label": string
        "description": string
        "type": string
    }
    classPeriods: ClassPeriodType[]
    holidays: HolidayType[]
    weekDays: {
        "friday": boolean
        "monday": boolean
        "saturday": boolean
        "sunday": boolean
        "thursday": boolean
        "tuesday": boolean
        "wednesday": boolean
    }
}

interface dataStoreRecord {
    academicYear: string
    defaults: {
        "academicYear": string
    },
    schoolCalendar: schoolCalendar[]
}

export interface AttendanceFormaterProps {
    dataValues: DataValuesProps[]
    occurredAt: string
    trackedEntity: string
    event: string
}
export type { dataStoreRecord, ClassPeriodType, HolidayType, schoolCalendar }
