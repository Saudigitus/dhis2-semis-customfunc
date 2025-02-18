import { formatHeaders } from "../../utils/table/header/formatHeaders"
// import { generateAttendanceDays } from "../../utils/table/header/generateAttendanceDays"
import { Modules } from "dhis2-semis-types"
import { CustomAttributeProps, DataStoreProps, ProgramConfig } from "dhis2-semis-types"

interface UseHeaderProps {
    tableColumns: CustomAttributeProps[]
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0]
    module: any
}
export function useHeader({ tableColumns, programConfigData, dataStoreData, module }: UseHeaderProps) {
    // const { getValidDays } = generateAttendanceDays()
    //const { attendanceMode } = useAttendanceMode({ AttendanceModeState })
    //const attendanceProgramStage = dataStoreData?.attendance?.programStage

    /*     const getModuleAditionalHeaders = () => {
            switch (module) {
                case Modules.Attendance:
                    return getAttendanceDays(getValidDays(selectedDate ?? new Date()), "view", programConfigData, attendanceProgramStage);
            
                default:
                    return [];
            }
        } */

    return {
        columns: formatHeaders({ programConfigData, dataStoreData, tableColumns, module }),
    }
}
