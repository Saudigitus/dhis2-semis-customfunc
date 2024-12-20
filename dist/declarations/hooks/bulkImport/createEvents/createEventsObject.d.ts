import { ProgramConfig } from "../../../types/programConfig/ProgramConfig";
import { DataStoreRecord } from "../../../types/dataStore/DataStoreConfig";
export declare function generateEventObjects(programStages: string[], data: any, programConfig: ProgramConfig): {
    events: any;
};
export declare function generateAttendanceEventObjects(programStages: string[], data: any, dataStore: DataStoreRecord): {
    attendanceEvents: any;
};
export declare function generateEnrollmentData(profile: string, programConfig: ProgramConfig, stagesToIgnore: string[], data: any, orgUnit: string, updating: boolean): {
    enrollments: any;
};
