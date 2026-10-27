import { DataValuesProps } from "../api/WithoutRegistrationTypes"

interface AttendanceFormaterProps {
    dataValues: DataValuesProps[]
    occurredAt: string
    trackedEntity: string
    event: string
}

interface attendanceConfig {
    absenceReason: string
    programStage: string
    status: string
    statusOptions: {
        code: string
        icon: string
    }[]
}

export type {
    AttendanceFormaterProps,
    attendanceConfig
}
