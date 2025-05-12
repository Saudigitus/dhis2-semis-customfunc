import { useState } from "react"
import { madatoryFieldsValidator } from "../../utils/bulk/validateMandatoryFields"
import { useDataEngine } from "@dhis2/app-runtime"

const checkTEI = async (engine: any, programId: string, ouID: string, filterParams: string[]): Promise<any[]> => {
    const queryResult = await engine.query({
        trackedEntities: {
            resource: 'tracker/trackedEntities',
            params: {
                program: programId,
                orgUnit: ouID,
                filter: filterParams
            },
            fields: ['trackedEntity', 'attributes', 'enrollments']
        }
    });
    if (queryResult?.trackedEntities?.instances.length > 0) {
        return queryResult.trackedEntities.instances
    }
    return []
}

const useValidateFile = (program: any, mutateType: "POST" | "UPDATE") => {
    const [loader, setLoader] = useState<boolean>(true)
    const engine = useDataEngine()
    const [validRecords, setValidRecords] = useState<any[]>([])
    const [invalidRecords, setInvalidRecords] = useState<any[]>([])

    const validador = async ({ module, data }: { module: string, data: any[] }) => {
        const { invalidData, madatoryFieldsAttributes, validData } = madatoryFieldsValidator(program, data)

        setInvalidRecords(invalidData)
        setValidRecords(mutateType === "UPDATE" ? validData : [])

        if (mutateType === "POST") {
            const filterParams = validData.map((student: any) => {
                const params = madatoryFieldsAttributes.flatMap((attributes: any) => {
                    const value = student?.['Student profile']?.[attributes.trackedEntityAttribute.id]
                    return [`${attributes.trackedEntityAttribute.id}:EQ:${value}`]
                })
                return { student, params }
            })

            setLoader(true)
            for (const params of filterParams) {
                const instances: any[] = await checkTEI(engine, program.id, params?.student?.Ids?.orgUnit, params.params)
                if (instances.length > 0) {
                    setInvalidRecords(prevState => [
                        ...prevState,
                        {
                            ...params.student,
                            errors: [
                                {
                                    key: "TEI",
                                    error: `TEI already exists in the system`
                                }
                            ]
                        }
                    ])
                } else {
                    setValidRecords(prevState => [
                        ...prevState,
                        {
                            ...params.student,
                        }
                    ])
                }
            }
            setLoader(false)
        }
    }
    return { validador, loader, validRecords, invalidRecords }
}
export { useValidateFile }