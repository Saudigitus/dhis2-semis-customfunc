import { SchoolCalendarDataStoreRecord, programStageDataElements } from "dhis2-semis-types";

const returnOptionsByDataElement = ({ programStageDataElement, schoolCalendar }:
    { programStageDataElement: programStageDataElements, schoolCalendar?: SchoolCalendarDataStoreRecord }): programStageDataElements["dataElement"]["optionSet"]["options"] => {
    const options: any = [];
    if (programStageDataElement && programStageDataElement?.dataElement?.optionSet) {
        if (programStageDataElement?.dataElement?.id === schoolCalendar?.academicYear) {
            programStageDataElement?.dataElement?.optionSet?.options?.forEach((option) => {
                if (schoolCalendar?.schoolCalendar?.some((op: any) => op?.academicYear?.label == option?.label || op?.academicYear?.code == option?.value))
                    options.push(option)
            })
            // chronological order: calendar start date, then the option code
            const startDateOf = (option: any) => String(schoolCalendar?.schoolCalendar?.find((op: any) => op?.academicYear?.code == option?.value || op?.academicYear?.label == option?.label)?.academicYear?.startDate ?? "")
            options.sort((a: any, b: any) => startDateOf(a).localeCompare(startDateOf(b)) || String(a?.value ?? "").localeCompare(String(b?.value ?? ""), undefined, { numeric: true }))
        }
        else {
            programStageDataElement?.dataElement?.optionSet?.options?.forEach((option) => {
                options.push(option)
            })
        }
    }

    return options
}

export { returnOptionsByDataElement }