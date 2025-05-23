import { attendanceConfig, AttendanceFormaterProps } from "src/types/table/FormatRowsDataTypes";
import { FormatResponseRowsProps, RowsDataProps } from "../../../types/common/FormatRowsDataProps";
import { dataValuesProps } from "../../../types/events/eventsProps";
import { attributesProps } from "../../../types/tei/teiProps";


export function formatRowsData({ registrationInstances, teiInstances }: FormatResponseRowsProps): RowsDataProps[] {
    const allRows: RowsDataProps[] = [];

    for (const event of registrationInstances ?? []) {
        const teiDetails = teiInstances?.find(tei => tei.trackedEntity === event.trackedEntity);

        allRows.push({
            ...dataValues(event.dataValues),
            ...(attributes((teiDetails?.attributes) ?? [])),
            trackedEntity: event.trackedEntity,
            enrollmentId: event?.enrollment,
            // If `teiInstances` is empty, the function is being called by `getStageData`, 
            // so the event ID needed comes from the other stage. 
            // To avoid overwriting data, a second key is required.
            ...(!teiInstances?.length ? { registrationEvent: event?.event } : { programStageEvent: event?.event }),
            registrationEventOccurredAt: event?.occurredAt ?? "",
            orgUnitId: teiDetails?.enrollments?.[0]?.orgUnit,
            programId: teiDetails?.enrollments?.[0]?.program,
            status: teiDetails?.enrollments?.[0]?.status,
            ownershipOu: teiDetails?.programOwners?.[0]?.orgUnit,
        });
    }
    return allRows;
}

export function dataValues(data: dataValuesProps[]): RowsDataProps {
    const localData: RowsDataProps = {};
    for (const dataElement of data) {
        localData[dataElement.dataElement] = dataElement.value;
    }
    return localData;
}

export function attributes(data: attributesProps[]): RowsDataProps {
    const localData: RowsDataProps = {};
    for (const attribute of data) {
        localData[attribute.attribute] = attribute.value;
    }
    return localData;
}

export function attendanceDataValuesFormater(data: AttendanceFormaterProps[], attendanceConfig: attendanceConfig): RowsDataProps {
    const localData: RowsDataProps = {}
    let status, absenceOption, eventId

    for (const event of data) {
        eventId = event.event
        for (const dataValue of event.dataValues) {
            if (attendanceConfig?.status === dataValue.dataElement) {
                status = dataValue.value
            }

            if (attendanceConfig?.absenceReason === dataValue.dataElement) {
                absenceOption = dataValue.value
            }
        }
        localData[event.occurredAt?.split("T")?.[0]] = { status, absenceOption, eventId }
    }
    return localData
}
