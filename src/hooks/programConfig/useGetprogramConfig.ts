import { useDataEngine } from "@dhis2/app-runtime";
import { ProgramConfig } from "../../types/programConfig/ProgramConfig";
import { useState } from 'react'

const PROGRAMQUERY: any = (id: string) => ({
    results: {
        resource: "programs",
        id: id,
        params: {
            fields: [
                "access",
                "id,displayName,description,programType,version",
                "trackedEntityType[id,trackedEntityTypeAttributes[trackedEntityAttribute[id]]]",
                "programTrackedEntityAttributes[mandatory,searchable,displayInList,trackedEntityAttribute[generated,pattern,id,displayName,formName,unique,valueType,optionSet[options[code~rename(value),displayName~rename(label)]]]]",
                "programStages[id,displayName,autoGenerateEvent,repeatable, programStageDataElements[displayInReports,compulsory,dataElement[id,displayName,formName,valueType,optionSet[options[code~rename(value),displayName~rename(label)]]]]]"
            ]
        }
    }
})


export function useGetProgramConfig() {
    const engine = useDataEngine();
    const [programConfig, setData] = useState<ProgramConfig>({} as unknown as ProgramConfig)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    async function getProgram(program: string) {
        setLoading(true)
        await engine.query(PROGRAMQUERY(program))
            .then((data: { results: any }) => {
                setData(data.results)
            })
            .catch((error: any) => {
                setError(error)
            })
            .finally(() => setLoading(false))
    }

    return { getProgram, programConfig, error, loading }
}
