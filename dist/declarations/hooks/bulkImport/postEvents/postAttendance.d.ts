import { importData } from "../../../types/bulk/bulkOperations";
export declare function postAttendanceValues({ setStats }: {
    setStats: any;
}): {
    postAttendance: (events: any[], programStageName: string, programStageId: string, excelData: any[], program: string, importMode: importData["importMode"]) => Promise<void>;
};
