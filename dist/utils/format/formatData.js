export function attributes(data) {
    const localData = {};
    for (const attribute of data) {
        localData[attribute.attribute] = attribute.value;
    }
    return localData;
}
export function dataValues(data, stageId) {
    const localData = {};
    for (const dataElement of data) {
        localData[`${stageId}.${dataElement.dataElement}`] = dataElement.value;
    }
    return localData;
}
export function attendanceFormater(events, attendanceConfig) {
    var _a, _b;
    const localData = {};
    let status = "";
    for (const event of events) {
        for (const dataValue of event.dataValues) {
            if ((attendanceConfig === null || attendanceConfig === void 0 ? void 0 : attendanceConfig.status) === dataValue.dataElement) {
                status = dataValue.value;
            }
        }
        localData[(_b = (_a = event.occurredAt) === null || _a === void 0 ? void 0 : _a.split("T")) === null || _b === void 0 ? void 0 : _b[0]] = status;
    }
    return localData;
}
