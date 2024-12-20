import { DataValuesProps } from "../api/WithoutRegistrationTypes";
export interface AttendanceFormaterProps {
    dataValues: DataValuesProps[];
    occurredAt: string;
    trackedEntity: string;
    event: string;
}
