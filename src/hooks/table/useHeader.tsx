import { formatHeaders } from "../../utils/table/header/formatHeaders"
// import { generateAttendanceDays } from "../../utils/table/header/generateAttendanceDays"
import { modules } from "../../types/common/moduleTypes"
import { CustomAttributeProps, DataStoreProps, ProgramConfig } from "dhis2-semis-components"

interface UseHeaderProps {
    tableColumns: CustomAttributeProps[]
    programConfigData: ProgramConfig[0]
    dataStoreData: DataStoreProps[0]
    module: modules
}
export function useHeader({ tableColumns, programConfigData, dataStoreData, module } : UseHeaderProps) {
    // const { getValidDays } = generateAttendanceDays()
    //const { attendanceMode } = useAttendanceMode({ AttendanceModeState })
    //const attendanceProgramStage = dataStoreData?.attendance?.programStage

/*     const getModuleAditionalHeaders = () => {
        switch (module) {
            case modules.attendance:
                return getAttendanceDays(getValidDays(selectedDate ?? new Date()), "view", programConfigData, attendanceProgramStage);
        
            default:
                return [];
        }
    } */

    return {
        columns: formatHeaders({ programConfigData, dataStoreData, tableColumns }),
    }
}
