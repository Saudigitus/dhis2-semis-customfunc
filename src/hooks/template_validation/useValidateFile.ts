import { useState } from "react"
import { madatoryFieldsValidator } from "../../utils/bulk/validateMandatoryFields"
import { useDataEngine } from "@dhis2/app-runtime"
import { useUrlParams } from "../commons/useQueryParams";
import { UNIQUE_VALUES_PER_REQUEST, UniqueValueQuery, buildInFilter, buildUniqueValueQueries, existingValueKey, splitRowsByExistingValues, splitRowsByRepeatedValues } from "../../utils/bulk/uniqueValues";
import useGetRegitration from "../commons/useGetRegistrationDataValues";

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
    const { useGetRegitrationDataElements } = useGetRegitration()

    const validador = async ({ module, data, dataStore }: { module: string, data: any[], dataStore: any }) => {
        // Registration values of the class selected on screen: rows of another class get a warning.
        const selectedClass = module === "enrollment" ? useGetRegitrationDataElements() : []
        const { invalidData, uniqueAttributes, validData } = madatoryFieldsValidator(program, data, module, Profile, dataStore, selectedClass)
        setInvalidRecords(invalidData)

        if (module !== "enrollment") {
            setValidRecords(validData)
        } else {
            setValidRecords(mutateType === "UPDATE" ? validData : [])
        }

        if (mutateType === "POST" && module === "enrollment") {
            // The profile section of the file of this module ("Student profile" / "Staff profile").
            const profileSection = Profile
            const orgUnit = school as unknown as string
            const errorKey = `${displayName ?? sectionType}`

            // A unique value repeated inside the file is invalid in all its rows.
            const inFile = splitRowsByRepeatedValues(validData, uniqueAttributes, profileSection, errorKey)
            setInvalidRecords(prevState => [...prevState, ...inFile.invalid])
            const queries = buildUniqueValueQueries(inFile.valid, uniqueAttributes, profileSection, orgUnit)

            setLoader(true)
            try {
                const existing = new Set<string>()
                for (const query of queries)
                    for (const key of await findExistingValues(engine, program.id, query)) existing.add(key)

                const { valid, invalid } = splitRowsByExistingValues(inFile.valid, uniqueAttributes, profileSection, orgUnit, existing, errorKey)
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