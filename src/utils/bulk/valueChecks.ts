// Checks of the values of a bulk file that the server would refuse (option lists, value types,
// enrollment date), so that the row is shown as invalid with the reason before anything is sent.

type RowError = { key: string, error: string }

const isEmpty = (value: any) => value === undefined || value === null || String(value).trim() === ""

const NUMBER = /^-?\d+(\.\d+)?$/
const INTEGER = /^-?\d+$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Value types checked here; dates have their own check and other types are free text.
const VALUE_TYPE_CHECKS: Record<string, (value: string) => boolean> = {
    NUMBER: (value) => NUMBER.test(value),
    INTEGER: (value) => INTEGER.test(value),
    INTEGER_POSITIVE: (value) => INTEGER.test(value) && Number(value) > 0,
    INTEGER_NEGATIVE: (value) => INTEGER.test(value) && Number(value) < 0,
    INTEGER_ZERO_OR_POSITIVE: (value) => INTEGER.test(value) && Number(value) >= 0,
    PERCENTAGE: (value) => NUMBER.test(value) && Number(value) >= 0 && Number(value) <= 100,
    UNIT_INTERVAL: (value) => NUMBER.test(value) && Number(value) >= 0 && Number(value) <= 1,
    BOOLEAN: (value) => ["true", "false"].includes(value.toLowerCase()),
    TRUE_ONLY: (value) => value.toLowerCase() === "true",
    EMAIL: (value) => EMAIL.test(value),
}

// Program stages whose values each module sends (the profile is sent only by the enrollment import).
export function stagesOfModule(module: string, dataStore: any): string[] {
    switch (module) {
        case "enrollment": return [dataStore?.registration?.programStage, dataStore?.["socio-economics"]?.programStage].filter(Boolean)
        case "final-result": return [dataStore?.["final-result"]?.programStage].filter(Boolean)
        case "performance": return (dataStore?.performance?.programStages ?? []).map((x: any) => x?.programStage).filter(Boolean)
        default: return []
    }
}

// Fields of the file checked for the module: attributes by id, data elements by "stage.dataElement".
export function fieldsOfModule(program: any, module: string, dataStore: any): Record<string, { name: string, valueType?: string, options?: any[] }> {
    const fields: Record<string, { name: string, valueType?: string, options?: any[] }> = {}

    if (module === "enrollment")
        for (const { trackedEntityAttribute: attribute } of program?.programTrackedEntityAttributes ?? [])
            fields[attribute?.id] = { name: attribute?.displayName ?? attribute?.name, valueType: attribute?.valueType, options: attribute?.optionSet?.options }

    const stages = stagesOfModule(module, dataStore)
    for (const stage of program?.programStages ?? []) {
        if (!stages.includes(stage?.id)) continue
        for (const { dataElement } of stage?.programStageDataElements ?? [])
            fields[`${stage.id}.${dataElement?.id}`] = {
                name: `${stage?.displayName ?? stage?.name} - ${dataElement?.displayName ?? dataElement?.name}`,
                valueType: dataElement?.valueType,
                options: dataElement?.optionSet?.options
            }
    }
    return fields
}

// A value of a field with options must be one of the option codes; other values must match the
// value type of the field.
export function validateFieldValues(student: any, fields: Record<string, { name: string, valueType?: string, options?: any[] }>): RowError[] {
    const errors: RowError[] = []

    for (const [section, values] of Object.entries(student ?? {})) {
        if (section === "Ids" || !values || typeof values !== "object") continue

        for (const [key, value] of Object.entries(values as Record<string, any>)) {
            const field = fields[key]
            if (!field || isEmpty(value)) continue
            const text = String(value).trim()

            if (field.options?.length) {
                if (!field.options.some((option: any) => String(option?.value) === text))
                    errors.push({ key: field.name, error: `"${text}" is not a valid option` })
            } else if (VALUE_TYPE_CHECKS[field.valueType ?? ""] && !VALUE_TYPE_CHECKS[field.valueType as string](text)) {
                errors.push({ key: field.name, error: `"${text}" is not a valid value (${field.valueType})` })
            }
        }
    }
    return errors
}

// The enrollment date of a new or updated enrollment is mandatory: when it is empty the
// enrollment would be dated the day of the import.
export function validateEnrollmentDate(student: any, module: string, profile: string): RowError[] {
    if (module !== "enrollment") return []

    for (const [section, values] of Object.entries(student ?? {})) {
        if (section === profile || section === "Ids" || !values || typeof values !== "object") continue
        if (!("enrollmentDate" in (values as any))) continue
        return isEmpty((values as any).enrollmentDate) ? [{ key: `${section} - Enrollment date`, error: "Empty required field" }] : []
    }
    return []
}

// Warnings when the academic year / grade / class of a row is not the one selected on screen:
// the row is valid but would be saved in another class. "selected" holds the registration
// values of the selected class ({ dataElement, value }).
export function otherClassWarnings(student: any, registrationStage: string, selected: { dataElement: string, value: any }[], program: any): RowError[] {
    const stage = (program?.programStages ?? []).find((x: any) => x?.id === registrationStage)
    const registration: any = Object.values(student ?? {}).find((values: any) =>
        values && typeof values === "object" && Object.keys(values).some(key => key.startsWith(`${registrationStage}.`)))
    if (!registration) return []

    const warnings: RowError[] = []
    for (const { dataElement, value } of selected ?? []) {
        if (!dataElement || isEmpty(value)) continue
        const rowValue = registration[`${registrationStage}.${dataElement}`]
        if (isEmpty(rowValue) || String(rowValue).trim() === String(value).trim()) continue

        const name = stage?.programStageDataElements?.find((x: any) => x?.dataElement?.id === dataElement)?.dataElement?.displayName ?? dataElement
        warnings.push({ key: name, error: `"${String(rowValue).trim()}" is not the selected one ("${value}"): the row will be saved in another class` })
    }
    return warnings
}
