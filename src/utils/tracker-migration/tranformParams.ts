function transformQueryParams({ rules, params }:
    { rules: Record<string, any>, params: Record<string, any> }): Record<string, any> {

    const finalParams: Record<string, any> = {}

    for (const [key, value] of Object.entries(params)) {
        const rule = rules[key]

        if (rule) {
            const newValue = rule.transform ? rule.transform(value) : value
            finalParams[rule.to] = newValue
        } else {
            finalParams[key] = value
        }
    }

    return finalParams
}

export { transformQueryParams }