const madatoryFieldsValidator = (program: any, fileRowData: any, module: string) => {
    const validData: any[] = []
    const invalidData: any[] = []
    const students = fileRowData
    const madatoryFieldsAttributes = program.programTrackedEntityAttributes.filter((field: any) => field.mandatory)
    const uniqueAttributes: any[] = program.programTrackedEntityAttributes.filter((attribute: any) => {
        return attribute.trackedEntityAttribute?.unique
    })


    students.forEach((student: any) => {
        if (validateMandatoryAttributtes(student, madatoryFieldsAttributes).length === 0 && validateMandatoryDataElements(student, program).length === 0) {
            validData.push({
                ...student,
                warnings: [...(validateAttendanceFields(module, student) || [])?.map((validateAttendanceField: any) => {
                    return { key: validateAttendanceField, error: "No attendance to this date" }
                })],
            })
        } else {
            invalidData.push({
                ...student,
                errors: [
                    ...(validateOptionalFields(student, module, program) || []).map((field: any) => {
                        return {
                            key: `${field?.displayName ?? field?.name}`,
                            error: "Empty required field"
                        }
                    }),
                    ...validateMandatoryAttributtes(student, madatoryFieldsAttributes).map((field: any) => { return { key: field?.displayName ?? field?.name, error: "Empty required field" } }),
                    ...validateMandatoryDataElements(student, program).map((field: any) => { return { key: field, error: "Empty required field" } })]
            })
        }
    });
    // console.log(validData, "ds")
    return { validData, invalidData, uniqueAttributes }
}

const validateMandatoryAttributtes = (student: any, madatoryFieldsAttributes: any): [] => {
    //FILTER ALL NULL, UNDEFINED AND EMPTY ATTRIBUTES
    return madatoryFieldsAttributes.filter(({ trackedEntityAttribute: { id } }: any) => {
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
            stage.programStageDataElements.filter(({ dataElement }: any) => {
                const fullId = `${stage.id}.${dataElement.id}`;
                const value = merged[fullId];
                return value === undefined || value === null || value === '';
            }).map(({ dataElement }: any) => dataElement?.displayName ?? dataElement?.name)
        ).flat();
}

const validateAttendanceFields = (module: string, student: any) => {
    if (module === "attendance") {
        const emptyEntries = Object.keys(student?.Attendance).filter(key => student?.Attendance[key] === ""
            || student?.Attendance[key] === null || student?.Attendance[key] === undefined
        );
        return emptyEntries;
    }
}

const validateOptionalFields = (student: any, module: string, program: any) => {
    const warningRecords: any = []
    //GET ALL PROGRAM STAGES WITH AT LEAST ONE MANDATORY DATA ELEMENT
    const nonMandatoryFieldsDataElements = program?.programStages.flatMap((programStage: any) =>
        programStage.programStageDataElements
            .filter((el: any) => !el.compulsory)
            .map((el: any) => ({
                ...el.dataElement,
                compulsory: el.compulsory,
                programStageId: programStage?.id,
                programStageName: programStage?.name ?? programStage?.displayName
            }))
    );

    if (module === "final-result") {
        const allEmpty = Object.keys(student?.['Final result']).filter(key => student?.['Final result'][key] === ""
            || student?.['Final result'][key] === null || student?.['Final result'][key] === undefined
        );

        allEmpty.forEach((key: any) => {
            warningRecords.push(nonMandatoryFieldsDataElements?.filter((field: any) => `${field?.programStageId}.${field?.id}` === key)?.[0])
        })
    } else if (module === "performance") {
        // const allEmpty = Object.keys(student?.['Performance']).filter(key => student?.['Final result'][key] === ""
        //     || student?.['Final result'][key] === null || student?.['Final result'][key] === undefined
        // );
    }

    return warningRecords
}

export { madatoryFieldsValidator }