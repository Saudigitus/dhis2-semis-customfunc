import { useEffect, useState } from "react"
import { formatHeaders } from "../../utils/table/header/formatHeaders"
import { CustomAttributeProps, DataStoreProps, ProgramConfig } from "dhis2-semis-types"

interface UseHeaderProps {
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0],
    programStage?: string
}

export function useHeader({  programConfigData, dataStoreData, programStage }: UseHeaderProps) {
    const [header, setHeader] = useState<CustomAttributeProps[]>()

    const getHeader = (programStage?: string) => {
        const localHeader = formatHeaders({ programConfigData, dataStoreData, programStage })
        setHeader(localHeader)
        return localHeader
    }

    useEffect(() => {
        setHeader(getHeader(programStage))
    }, [programConfigData, programStage])

    return { columns: header, getHeader }
}