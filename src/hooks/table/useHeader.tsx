import { formatHeaders } from "../../utils/table/header/formatHeaders"
import { CustomAttributeProps, DataStoreProps, ProgramConfig } from "dhis2-semis-types"

interface UseHeaderProps {
    tableColumns: CustomAttributeProps[]
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0],
    programStage: string
}
export function useHeader({ tableColumns, programConfigData, dataStoreData, programStage }: UseHeaderProps) {

    function getHeader(ps: string) {
        return formatHeaders({ programConfigData, dataStoreData, tableColumns, programStage: ps })
    }

    return {
        columns: getHeader(programStage),
        getHeader
    }
}
