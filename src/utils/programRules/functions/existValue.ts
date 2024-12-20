/** Replaces variable value with the corresponding condition. */
function existValue(condition: string | undefined, values: Record<string, any> = {}, formatKeyValueType:  Record<string, any> = {}) {
    let localCondition = condition as string;
    let valueToReturn = condition as string
    const dataArray = condition?.split(/[^a-zA-Z0-9À-ÿ_ ]+/)
        .map(item => item.trim().replace(/^'(.*)'$/, '$1')).filter(item => item.length > 0);

    for (const value of Object.keys(values) || []) {
        if (dataArray?.includes(value)) {

            if (localCondition.includes(`false`)) {
                localCondition = condition as string
            }

            switch (formatKeyValueType[value]) {
                case "BOOLEAN":
                    localCondition = localCondition.replaceAll(value, `${values[value]}`.replaceAll("false", "0").replaceAll("true", "1"))
                    break;

                case "NUMBER":
                case "INTEGER_ZERO_OR_POSITIVE":
                    valueToReturn = valueToReturn.replaceAll(`'${value}'`, String(Number(values[value] ?? 0)))
                    if (!/[a-zA-Z]/.test(valueToReturn)) {
                        localCondition = valueToReturn
                    } else {
                        localCondition = "0"
                    }
                    break;

                default:
                    localCondition = localCondition.replaceAll(value, `${values[value]}`)
                    break;
            }
        }
    }

    return localCondition;
}

export { existValue }