import { useState } from "react"
import { madatoryFieldsValidator } from "../../utils/bulk/validateMandatoryFields"
import { useDataEngine } from "@dhis2/app-runtime"
import { useUrlParams } from "../commons/useQueryParams";

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
    if (queryResult?.trackedEntities?.instances?.length > 0 || queryResult?.trackedEntities?.trackedEntities.length > 0) {
        return queryResult.trackedEntities.instances ? queryResult.trackedEntities.instances : queryResult.trackedEntities.trackedEntities
    }
    return []
}

const useValidateFile = (program: any, mutateType: "POST" | "UPDATE") => {
    const [loader, setLoader] = useState<boolean>(false)
    const engine = useDataEngine()
    const [validRecords, setValidRecords] = useState<any[]>([])
    const [invalidRecords, setInvalidRecords] = useState<any[]>([])
    const { displayName } = program
    const { urlParameters } = useUrlParams()
    const { sectionType, school } = urlParameters()

    const validador = async ({ module, data }: { module: string, data: any[] }) => {
        const { invalidData, uniqueAttributes, validData } = madatoryFieldsValidator(program, data, module)
        setInvalidRecords(invalidData)

        if (module !== "enrollment") {
            setValidRecords(validData)
        } else {
            setValidRecords(mutateType === "UPDATE" ? validData : [])
        }

        if (mutateType === "POST" && module === "enrollment") {
            const filterParams = validData.map((student: any) => {
                const params = uniqueAttributes.flatMap((attributes: any) => {
                    const value = student?.['Student profile']?.[attributes.trackedEntityAttribute.id]
                    return [`${attributes.trackedEntityAttribute.id}:EQ:${value}`]
                })
                return { student, params }
            })


            setLoader(true)
            for (const params of filterParams) {
                console.log("ou in id", params?.student?.Ids?.orgUnit, "ou in params", school)
                let isValid = true;
                for (const param of params?.params) {
                    const instances: any[] = await checkTEI(engine, program.id, params?.student?.Ids?.orgUnit ?? school, [param])
                    if (instances.length > 0) {
                        setInvalidRecords(prevState => [
                            ...prevState,
                            {
                                ...params.student,
                                errors: [
                                    {
                                        key: `${displayName ?? sectionType}`,
                                        error: `already exists in the system`
                                    }
                                ]
                            }
                        ])
                        isValid = false
                        break
                    }
                }
                if (isValid) {
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