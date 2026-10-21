// Helpers to check the unique values of a bulk file against the server in a few requests
// (many values per request) instead of one request per row and per unique attribute.

export const UNIQUE_VALUES_PER_REQUEST = 100

export type UniqueValueQuery = { orgUnit: string, attribute: string, values: string[] }

const normalize = (value: any) => String(value).trim().toLowerCase()

// DHIS2 tracker filters use ":" ";" and "," as separators; "/" escapes them inside a value.
export const escapeFilterValue = (value: string) => value.replace(/[/:;,]/g, (char) => `/${char}`)

export const buildInFilter = (attribute: string, values: string[]) =>
    `${attribute}:in:${values.map(escapeFilterValue).join(";")}`

// One query per school, unique attribute and group of values (same school as the check per row).
export function buildUniqueValueQueries(rows: any[], uniqueAttributes: any[], profile: string, defaultOrgUnit: string, perRequest = UNIQUE_VALUES_PER_REQUEST): UniqueValueQuery[] {
    const valuesByOrgUnit: Record<string, Record<string, Set<string>>> = {}

    for (const row of rows) {
        const orgUnit = row?.Ids?.orgUnit ?? defaultOrgUnit
        for (const { trackedEntityAttribute: { id } } of uniqueAttributes) {
            const value = row?.[profile]?.[id]
            if (value === undefined || value === null || String(value).trim() === "") continue
            valuesByOrgUnit[orgUnit] ??= {}
            valuesByOrgUnit[orgUnit][id] ??= new Set()
            valuesByOrgUnit[orgUnit][id].add(String(value).trim())
        }
    }

    const queries: UniqueValueQuery[] = []
    for (const [orgUnit, byAttribute] of Object.entries(valuesByOrgUnit)) {
        for (const [attribute, valueSet] of Object.entries(byAttribute)) {
            const values = [...valueSet]
            for (let i = 0; i < values.length; i += perRequest)
                queries.push({ orgUnit, attribute, values: values.slice(i, i + perRequest) })
        }
    }
    return queries
}

// Key used to remember a value found on the server for a school and attribute.
export const existingValueKey = (orgUnit: string, attribute: string, value: any) => `${orgUnit}|${attribute}|${normalize(value)}`

// Rows with a unique value that already exists in their school are invalid; the others stay valid.
export function splitRowsByExistingValues(rows: any[], uniqueAttributes: any[], profile: string, defaultOrgUnit: string, existing: Set<string>, errorKey: string) {
    const valid: any[] = []
    const invalid: any[] = []

    for (const row of rows) {
        const orgUnit = row?.Ids?.orgUnit ?? defaultOrgUnit
        const exists = uniqueAttributes.some(({ trackedEntityAttribute: { id } }: any) => {
            const value = row?.[profile]?.[id]
            return value !== undefined && value !== null && String(value).trim() !== "" && existing.has(existingValueKey(orgUnit, id, value))
        })

        if (exists) invalid.push({ ...row, errors: [{ key: errorKey, error: "already exists in the system" }] })
        else valid.push({ ...row })
    }
    return { valid, invalid }
}
