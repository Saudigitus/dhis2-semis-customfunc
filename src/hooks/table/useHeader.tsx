import { useEffect } from "react"
import { formatHeaders } from "../../utils/table/header/formatHeaders"
import { CustomAttributeProps, DataStoreProps, ProgramConfig } from "dhis2-semis-types"

interface UseHeaderProps {
    tableColumns: CustomAttributeProps[]
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0],
    programStage: string
}
export function useHeader({ tableColumns, programConfigData, dataStoreData, programStage }: UseHeaderProps) {

    const getHeader = (ps: string) => {
        return formatHeaders({ programConfigData, dataStoreData, tableColumns, programStage: ps })
    }


    useEffect(())

    
    return {
        columns: getHeader(programStage),
        getHeader
    }
}
