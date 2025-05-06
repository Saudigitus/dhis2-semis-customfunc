import { DataValuesProps } from "../api/WithoutRegistrationTypes"

export interface AttendanceFormaterProps {
    dataValues: DataValuesProps[]
    occurredAt: string
    trackedEntity: string
    event: string
}

export interface SchoolCalendar {
    classPeriods: [
        {
            description: string
            endDate: string
            startDate: string
        }
    ]
    holidays: [
        {
            date: any
            event: string
        }
    ]
    weekDays: {
        friday: boolean
        monday: boolean
        saturday: boolean
        sunday: boolean
        thursday: boolean
        tuesday: boolean
        wednesday: boolean
    }
}
