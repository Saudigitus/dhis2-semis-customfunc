export function getMetaData(programConfig, stagesId) {
    var _a;
    let metaDataArray = [
        { programId: programConfig.id, programName: programConfig.displayName, id: "ref", name: "Ref", valueType: "TEXT" },
        { id: "orgUnitName", name: "School", valueType: "TEXT" },
        { id: "orgUnit", name: "School UID", valueType: "TEXT" },
    ];
    programConfig.programTrackedEntityAttributes.map((att) => {
        var _a, _b, _c, _d;
        const options = (_d = (_c = (_b = (_a = att === null || att === void 0 ? void 0 : att.trackedEntityAttribute) === null || _a === void 0 ? void 0 : _a.optionSet) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.map(option => option.label).join(' | ')) !== null && _d !== void 0 ? _d : "";
        metaDataArray.push({ id: att === null || att === void 0 ? void 0 : att.trackedEntityAttribute.id, name: att === null || att === void 0 ? void 0 : att.trackedEntityAttribute.displayName, valueType: att === null || att === void 0 ? void 0 : att.trackedEntityAttribute.valueType, options: options });
    });
    for (const stageId of stagesId) {
        const currStage = (_a = programConfig === null || programConfig === void 0 ? void 0 : programConfig.programStages) === null || _a === void 0 ? void 0 : _a.find(x => x.id == stageId);
        currStage === null || currStage === void 0 ? void 0 : currStage.programStageDataElements.map((de) => {
            var _a, _b, _c, _d;
            const options = (_d = (_c = (_b = (_a = de === null || de === void 0 ? void 0 : de.dataElement) === null || _a === void 0 ? void 0 : _a.optionSet) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.map(option => option.label).join(' | ')) !== null && _d !== void 0 ? _d : "";
            metaDataArray.push({ id: de.dataElement.id, name: de.dataElement.displayName, valueType: de.dataElement.valueType, options: options });
        });
    }
    return metaDataArray;
}
