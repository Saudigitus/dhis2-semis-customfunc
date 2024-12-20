interface Attendance {
    absenceReason: string;
    programStage: string;
    status: string;
    statusOptions: [
        {
            code: string;
            icon: string;
            color: string;
            key: string;
        }
    ];
}
interface SimpleProgramStage {
    programStage: string;
}
interface Performance {
    programStages: SimpleProgramStage[];
}
interface Registration {
    academicYear: string;
    grade: string;
    programStage: string;
    section: string;
}
interface Transfer {
    destinySchool: string;
    programStage: string;
    status: string;
    statusOptions: [
        {
            key: string;
            code: string;
        }
    ];
}
interface Defaults {
    currentAcademicYear: string;
    defaultOrder: string;
}
interface filterItem {
    code: string;
    order: number;
    dataElement: string;
}
interface Filters {
    dataElements: filterItem[];
}
interface DataStoreRecord {
    attendance: Attendance;
    key: string;
    trackedEntityType: string;
    lastUpdate: string;
    performance: Performance;
    program: string;
    filters: Filters;
    registration: Registration;
    ["socio-economics"]: SimpleProgramStage;
    transfer: Transfer;
    ["final-result"]: SimpleProgramStage;
    defaults: Defaults;
}
export type { DataStoreRecord, Transfer, Registration, Performance, Attendance, SimpleProgramStage, Filters, filterItem };
