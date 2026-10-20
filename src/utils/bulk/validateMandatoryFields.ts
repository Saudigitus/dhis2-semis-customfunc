import { getDateValidationIssue } from "../format/checkDateFormat";
import { classRecordErrors, isClassRecordRow } from "./classRecord";
import { enrollmentDateName, fieldsOfModule, otherClassWarnings, validateEnrollmentDate, validateFieldValues } from "./valueChecks";

const DATE_FORMAT_VALIDATION_ERROR = "Invalid date format. Expected YYYY-MM-DD"
const DATE_VALUE_VALIDATION_ERROR = "Invalid date value. Use a real date in YYYY-MM-DD"
const DATE_VALUE_TYPE = "DATE"
// Written by the attendance export on the days without school (locked cells).
const NON_SCHOOL_DAY = "Non School Day"
// Offered in the attendance file when the class attendance status is enabled.
const PRESENT = "present"
// "absent | SICK": the absence with its reason of absence in the same cell (same separator in
// dhis2-semis-components, export and import).
const REASON_SEPARATOR = " | "

// "selectedClass": registration values of the class selected on screen ({ dataElement, value }),
// used to warn about rows of another class (enrollment files).
const madatoryFieldsValidator = (program: any, fileRowData: any, module: string, profile: string, dataStore: any, selectedClass: { dataElement: string, value: any }[] = []) => {
    const validData: any[] = []
    const invalidData: any[] = []
    const students = fileRowData
    const { attendance } = dataStore
    const madatoryFieldsAttributes = program.programTrackedEntityAttributes.filter((field: any) => field.mandatory)
    const uniqueAttributes: any[] = program.programTrackedEntityAttributes.filter((attribute: any) => {
        return attribute.trackedEntityAttribute?.unique
    })
    // Fields whose options and value types are checked (only those the module sends).
    const checkedFields = fieldsOfModule(program, module, dataStore)


    students.forEach((student: any) => {
        // Attendance files: the row "Class record status" is not a person; only its values are checked.
        if (module === "attendance" && isClassRecordRow(student)) {
            const errors = classRecordErrors(student)
            if (errors.length) invalidData.push({ ...student, classRecord: true, errors })
            else validData.push({ ...student, classRecord: true, warnings: [] })
            return
        }

        // The person fields are saved only by the enrollment import: the other files (attendance,
        // performance, final result) may hold only the columns of the list.
        const mandatoryAttributeErrors = module === "enrollment" ? validateMandatoryAttributtes(student, madatoryFieldsAttributes, profile) : []
        const mandatoryDataElementErrors = validateMandatoryDataElements(student, program, profile, dataStore, module)
        const invalidDateFormatErrors = validateDateFields(student, program, profile)
        // The attendance cells exist only in attendance files. For the other modules the
        // attendance check does not apply, so it must neither fail nor block the row.
        const isAttendance = module === "attendance"
        const { filledEntries, invalidEntries } = isAttendance
            ? validateAttendanceFields(student, attendance, program)
            : { filledEntries: [], invalidEntries: [] }
        // Values the server would refuse (option, value type) and an empty enrollment date.
        const valueErrors = [...validateFieldValues(student, checkedFields), ...validateEnrollmentDate(student, module, profile, program)]

        if (invalidEntries.length === 0 && mandatoryAttributeErrors.length === 0 && mandatoryDataElementErrors.length === 0 && invalidDateFormatErrors.length === 0 && valueErrors.length === 0) {

            validData.push({
                ...student,
                warnings: [
                    ...filledEntries.map((validateAttendanceField: any) => {
                        return { key: validateAttendanceField, error: student?.Attendance?.[validateAttendanceField] }
                    }),
                    ...(validatePerformanceFields(student, module, program, dataStore) || []).map((field: any) => {
                        return {
                            key: `${field?.programStageName} - ${field?.displayName ?? field?.name}`,
                            error: "Empty required field"
                        }
                    }),
                    ...(module === "enrollment" ? otherClassWarnings(student, dataStore?.registration?.programStage, selectedClass, program) : [])
                ],
            })
        }

        if (invalidEntries.length !== 0 || mandatoryAttributeErrors.length !== 0 || mandatoryDataElementErrors.length !== 0 || invalidDateFormatErrors.length !== 0 || valueErrors.length !== 0) {
            invalidData.push({
                ...student,
                errors: [
                    ...invalidEntries.map((day: string) => {
                        return { key: day, error: `"${String(student?.Attendance?.[day]).trim()}" is not a valid attendance option` }
                    }),
                    ...(validateOptionalFields(student, module, program) || []).map((field: any) => {
                        return {
                            key: `${field?.displayName ?? field?.name}`,
                            error: "Empty required field"
                        }
                    }),
                    ...mandatoryAttributeErrors.map((field: any) => { return { key: field?.displayName ?? field?.name, error: "Empty required field" } }),
                    ...mandatoryDataElementErrors.map((field: any) => { return { key: field, error: "Empty required field" } }),
                    ...invalidDateFormatErrors,
                    ...valueErrors
                ]
            })
        }
    });
    return { validData, invalidData, uniqueAttributes }
}

const validateMandatoryAttributtes = (student: any, madatoryFieldsAttributes: any, profile: string): [] => {
    //FILTER ALL NULL, UNDEFINED AND EMPTY ATTRIBUTES
    console.log(student, madatoryFieldsAttributes)
    return madatoryFieldsAttributes.filter(({ trackedEntityAttribute: { id } }: any) => {
        const value = student?.[profile]?.[id];
        return value === undefined || value === null || value === '';
    });
}

const validateMandatoryDataElements = (student: any, program: any, profile: string, dataStore: any, module: string): [] => {
    const toValidateProgramStage = {
        "final-result": [dataStore?.['final-result']?.programStage],
        "enrollment": [dataStore?.registration?.programStage,
        dataStore?.['socio-economics']?.programStage],
        "attendance": [dataStore?.attendance?.programStage],
        // Every term configured for Performance (any number, any name).
        "performance": dataStore?.performance?.programStages?.map((item: any) => item?.programStage) ?? [],
    }
    //GET ALL PROGRAM STAGES WITH AT LEAST ONE MANDATORY DATA ELEMENT
    const madatoryFieldsProgramStages = program?.programStages.map((programStage: any) => {
        if (!toValidateProgramStage?.[module]?.includes(programStage.id)) return null;
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
        .filter(([key]) => key !== profile && key !== "Ids")
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

const validateDateFields = (student: any, program: any, profile: string) => {
    const dateErrors: Array<{ key: string, error: string }> = []
    const profileValues = student?.[profile] ?? {}
    const mergedStageValues = Object.assign(
        {},
        ...Object.entries(student)
            .filter(([key]) => key !== profile && key !== "Ids")
            .map(([_, value]) => value)
    )

    for (const programAttribute of (program?.programTrackedEntityAttributes ?? [])) {
        const trackedEntityAttribute = programAttribute?.trackedEntityAttribute
        if (trackedEntityAttribute?.valueType !== DATE_VALUE_TYPE) continue

        const value = profileValues?.[trackedEntityAttribute?.id]
        if (value === undefined || value === null || value === '') continue

        const issue = getDateValidationIssue(String(value))
        if (issue) {
            dateErrors.push({
                key: trackedEntityAttribute?.displayName ?? trackedEntityAttribute?.name,
                error: issue === "FORMAT" ? DATE_FORMAT_VALIDATION_ERROR : DATE_VALUE_VALIDATION_ERROR
            })
        }
    }

    for (const programStage of (program?.programStages ?? [])) {
        for (const programStageDataElement of (programStage?.programStageDataElements ?? [])) {
            const dataElement = programStageDataElement?.dataElement
            if (dataElement?.valueType !== DATE_VALUE_TYPE) continue

            const value = mergedStageValues?.[`${programStage?.id}.${dataElement?.id}`]
            if (value === undefined || value === null || value === '') continue

            const issue = getDateValidationIssue(String(value))
            if (issue) {
                dateErrors.push({
                    key: `${programStage?.displayName ?? programStage?.name} - ${dataElement?.displayName ?? dataElement?.name}`,
                    error: issue === "FORMAT" ? DATE_FORMAT_VALIDATION_ERROR : DATE_VALUE_VALIDATION_ERROR
                })
            }
        }
    }

    // "enrollmentDate" is a template/system field used to build enrollment payload dates.
    for (const [section, sectionValues] of Object.entries(student ?? {})) {
        if (section === profile || section === "Ids") continue

        const enrollmentDate = (sectionValues as any)?.enrollmentDate
        if (enrollmentDate === undefined || enrollmentDate === null || enrollmentDate === '') continue

        const issue = getDateValidationIssue(String(enrollmentDate))
        if (issue) {
            dateErrors.push({
                key: `${section} - ${enrollmentDateName(program)}`,
                error: issue === "FORMAT" ? DATE_FORMAT_VALIDATION_ERROR : DATE_VALUE_VALIDATION_ERROR
            })
        }
    }

    return dateErrors
}

// Attendance files only: the caller runs this check for the attendance module alone.
// An empty cell means nothing to record; "Non School Day" is written by the export on the days
// without school; any other value must be one of the attendance options, "present" (offered in
// the file when the class attendance status is enabled: it removes an absence saved before) or the
// option mapped as absence with a reason of absence of the list ("absent | SICK").
export const validateAttendanceFields = (student: any, attendance: any, program?: any): { filledEntries: string[], invalidEntries: string[] } => {
    const absent = (attendance?.statusOptions ?? []).find((x: any) => x?.configKey === "absentCode")?.code
    const stage = (program?.programStages ?? []).find((x: any) => x?.id === attendance?.programStage)
    const reasons: string[] = ((stage?.programStageDataElements ?? []).find((x: any) => x?.dataElement?.id === attendance?.absenceReason)
        ?.dataElement?.optionSet?.options ?? []).map((option: any) => String(option?.value ?? option?.code ?? "").trim()).filter(Boolean)
    const statusOptions: string[] = [
        ...(attendance?.statusOptions ?? []).map((x: any) => x.code),
        ...(attendance?.attendanceStatus?.allowAttendanceStatus ? [PRESENT] : []),
        ...(absent ? reasons.map(reason => `${absent}${REASON_SEPARATOR}${reason}`) : [])
    ]
    const days = student?.Attendance ?? {}
    const value = (day: string) => days[day] === undefined || days[day] === null ? "" : String(days[day]).trim()

    const filledEntries = Object.keys(days).filter(day => statusOptions.includes(value(day)))
    const invalidEntries = Object.keys(days).filter(day => value(day) !== "" && value(day) !== NON_SCHOOL_DAY && !statusOptions.includes(value(day)))

    return { filledEntries, invalidEntries };
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
    }
    return warningRecords
}

// Performance: the terms are the program stages configured for Performance (any number, any name);
// a term that is not in the file is skipped. Empty marks are listed as warnings.
const validatePerformanceFields = (student: any, module: string, program: any, dataStore: any) => {
    const warningRecords: any = []
    if (module !== "performance") return warningRecords
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
    const termIds: string[] = (dataStore?.performance?.programStages ?? []).map((item: any) => item?.programStage)
    const termSections = (program?.programStages ?? [])
        .filter((programStage: any) => termIds.includes(programStage?.id))
        .map((programStage: any) => student?.[programStage?.displayName ?? programStage?.name] ?? student?.[programStage?.name])
        .filter(Boolean)

    for (const term of termSections) {
        Object.keys(term)
            .filter(key => term[key] === "" || term[key] === null || term[key] === undefined)
            .forEach((key: any) => {
                warningRecords.push(nonMandatoryFieldsDataElements?.filter((field: any) => `${field?.programStageId}.${field?.id}` === key)?.[0])
            })
    }
    return warningRecords.filter(Boolean)
}

export { madatoryFieldsValidator }
