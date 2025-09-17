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