import { useState } from "react"
import { madatoryFieldsValidator } from "../../utils/bulk/validateMandatoryFields"
import { useDataEngine } from "@dhis2/app-runtime"
import { useUrlParams } from "../commons/useQueryParams";
import { UNIQUE_VALUES_PER_REQUEST, UniqueValueQuery, buildInFilter, buildUniqueValueQueries, existingValueKey, splitRowsByExistingValues } from "../../utils/bulk/uniqueValues";

// Returns the values of the given unique attribute that already exist in the school, reading
// many values per request (paged) instead of one request per value.
const findExistingValues = async (engine: any, programId: string, query: UniqueValueQuery): Promise<Set<string>> => {
    const found = new Set<string>()
    const pageSize = UNIQUE_VALUES_PER_REQUEST
    let page = 1, received = 0

    do {
        const queryResult = await engine.query({
            trackedEntities: {
                resource: 'tracker/trackedEntities',
                params: {
                    program: programId,
                    orgUnit: query.orgUnit,
                    filter: [buildInFilter(query.attribute, query.values)],
                    page,
                    pageSize
                },
                fields: ['trackedEntity', 'attributes[attribute,value]']
            }
        });
        const instances: any[] = queryResult?.trackedEntities?.instances ?? queryResult?.trackedEntities?.trackedEntities ?? []

        for (const instance of instances)
            for (const attribute of (instance?.attributes ?? []))
                if (attribute?.attribute === query.attribute)
                    found.add(existingValueKey(query.orgUnit, query.attribute, attribute?.value))

        received = instances.length
        page++
    } while (received === pageSize)

    return found
}

const useValidateFile = (program: any, mutateType: "POST" | "UPDATE") => {
    const [loader, setLoader] = useState<boolean>(false)
    const engine = useDataEngine()
    const [validRecords, setValidRecords] = useState<any[]>([])
    const [invalidRecords, setInvalidRecords] = useState<any[]>([])
    const { displayName } = program
    const { urlParameters } = useUrlParams()
    const { sectionType, school } = urlParameters
    const Profile = (sectionType ?? '').substring(0, 1).toUpperCase() + (sectionType ?? '').substring(1, (sectionType ?? '').length) + ' profile'

    const validador = async ({ module, data, dataStore }: { module: string, data: any[], dataStore: any }) => {
        const { invalidData, uniqueAttributes, validData } = madatoryFieldsValidator(program, data, module, Profile, dataStore)
        setInvalidRecords(invalidData)

        if (module !== "enrollment") {
            setValidRecords(validData)
        } else {
            setValidRecords(mutateType === "UPDATE" ? validData : [])
        }

        if (mutateType === "POST" && module === "enrollment") {
            // The check against the server reads only the student profile section (staff: SEMIS-211).
            const profileSection = 'Student profile'
            const orgUnit = school as unknown as string
            const queries = buildUniqueValueQueries(validData, uniqueAttributes, profileSection, orgUnit)

            setLoader(true)
            try {
                const existing = new Set<string>()
                for (const query of queries)
                    for (const key of await findExistingValues(engine, program.id, query)) existing.add(key)

                const { valid, invalid } = splitRowsByExistingValues(validData, uniqueAttributes, profileSection, orgUnit, existing, `${displayName ?? sectionType}`)
                setInvalidRecords(prevState => [...prevState, ...invalid])
                setValidRecords(prevState => [...prevState, ...valid])
            } finally {
                // Release the loader also when a request fails; the error is passed on to the
                // caller, which shows it to the user.
                setLoader(false)
            }
        }
    }
    return { validador, loader, validRecords, invalidRecords }
}
export { useValidateFile }