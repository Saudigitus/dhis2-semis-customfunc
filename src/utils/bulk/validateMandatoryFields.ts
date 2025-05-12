const madatoryFieldsValidator = (program: any, fileRowData: any) => {
    const validData: any[] = []
    const invalidData: any[] = []
    const students = fileRowData
    const madatoryFieldsAttributes = program.programTrackedEntityAttributes.filter((field: any) => field.mandatory)


    students.forEach((student: any) => {
        if (validateMandatoryAttributtes(student, madatoryFieldsAttributes).length === 0 && validateMandatoryDataElements(student, program).length === 0) {
            validData.push(student)
        } else {
            invalidData.push({
                ...student,
                errors: [...validateMandatoryAttributtes(student, madatoryFieldsAttributes).map((field: any) => field.name).map((field: any) => { return { key: field, error: "Empty required field" } }), ...validateMandatoryDataElements(student, program).map((field: any) => { return { key: field, error: "Empty required field" } })]
            })
        }
    });
    return {validData,invalidData,madatoryFieldsAttributes}
}

const validateMandatoryAttributtes = (student: any, madatoryFieldsAttributes: any): [] => {
    //FILTER ALL NULL, UNDEFINED AND EMPTY ATTRIBUTES
    return madatoryFieldsAttributes.filter(({ trackedEntityAttribute: { id } }) => {
        const value = student?.['Student profile']?.[id];
        return value === undefined || value === null || value === '';
    });
}

const validateMandatoryDataElements = (student: any, program: any): [] => {
    //GET ALL PROGRAM STAGES WITH AT LEAST ONE MANDATORY DATA ELEMENT
    const madatoryFieldsProgramStages = program?.programStages.map((programStage: any) => {
        const compulsoryElements = programStage.programStageDataElements.filter((el: any) => el.compulsory);
        if (compulsoryElements.length === 0) return null;
        return {
            name: programStage.name,
            id: programStage.id,
            programStageDataElements: compulsoryElements
        };
    }).filter(Boolean)


    // FILTER ALL STUDENT FILE PROGRAM STAGES AND MERGE ON ONE OBJECT
    const filteredObjects = Object.entries(student)
        .filter(([key]) => key !== "Student profile" && key !== "Ids")
        .map(([_, value]) => value);
    const merged = Object.assign({}, ...filteredObjects);

    return madatoryFieldsProgramStages
        .map((stage: any) =>
            //FILTER ALL NULL, UNDEFINED AND EMPTY DATA ELEMENTS
            stage.programStageDataElements.filter(({ dataElement }) => {
                const fullId = `${stage.id}.${dataElement.id}`;
                const value = merged[fullId];
                return value === undefined || value === null || value === '';
            }).map(({ dataElement }) => dataElement?.displayName)
        ).flat();
}
export { madatoryFieldsValidator }