export function formatKeyValueType(variables) {
    const keys = {};
    if (Object.keys(variables[0]).includes("fields")) {
        for (const iterator of variables) {
            if (iterator === null || iterator === void 0 ? void 0 : iterator.fields) {
                for (const variable of iterator === null || iterator === void 0 ? void 0 : iterator.fields) {
                    keys[variable.name] = variable.valueType;
                }
            }
        }
    }
    else {
        for (const variable of variables) {
            keys[variable.id] = variable.valueType;
        }
    }
    return keys;
}
