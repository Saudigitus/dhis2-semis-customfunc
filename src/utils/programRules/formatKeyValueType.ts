import { GroupFormProps } from "dhis2-semis-components"

export function formatKeyValueType(variables: GroupFormProps[] | GroupFormProps['fields']): Record<string, string> {
    const keys: Record<string, any> = {}

    if (Object.keys(variables[0]).includes("fields")) {
        for (const iterator of variables as GroupFormProps[]) {
            if (iterator?.fields) {
                for (const variable of iterator?.fields) {
                    keys[variable.name] = variable.valueType
                }
            }
        }
    }

    else {
        for (const variable of variables as GroupFormProps['fields']) {
            keys[variable.id] = variable.valueType
        }
    }


    return keys
}
