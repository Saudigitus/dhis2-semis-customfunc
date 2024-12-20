import { importData } from "../../../types/bulk/bulkOperations";
import { ProgramConfig } from "../../../types/programConfig/ProgramConfig";
export declare function postValues({ setStats }: {
    setStats: any;
}): {
    postData: (data: any[], excelData: any, importMode: importData["importMode"], programConfig: ProgramConfig, programStages: string[]) => Promise<void>;
};
