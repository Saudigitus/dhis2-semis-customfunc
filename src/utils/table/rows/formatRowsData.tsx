import { attributesProps } from "../../../types/api/WithRegistrationTypes";
import { dataValuesProps } from "../../../types/api/WithoutRegistrationTypes";
import { attendanceConfig, AttendanceFormaterProps } from "src/types/table/FormatRowsDataTypes";
import { FormatResponseRowsProps, RowsDataProps } from "../../../types/common/FormatRowsDataProps";

export function formatRowsData({ registrationInstances, teiInstances, isBasicStage = false }: FormatResponseRowsProps): RowsDataProps[] {
    const allRows: RowsDataProps[] = [];

    for (const event of registrationInstances ?? []) {
        const teiDetails = teiInstances?.find(tei => tei.trackedEntity === event.trackedEntity);

        // Find the enrollment that matches the current academic year event's 
        const currentEnrollment = teiDetails?.enrollments?.find(enrollment => enrollment.enrollment === event.enrollment);

        allRows.push({
            ...dataValues(event.dataValues),
            ...(attributes((teiDetails?.attributes) ?? [])),
            // If isBasicStage is false, the function is being called by `getStageData`, 
            // so the event ID needed comes from the other stage. 
            // To avoid overwriting data, a second key is required.
            ...(isBasicStage ?
                {
                    registrationEvent: event?.event,
                    registrationEventOccurredAt: event?.occurredAt,
                    enrollmentId: event?.enrollment,
                    trackedEntity: event.trackedEntity,
                    orgUnitId: currentEnrollment?.orgUnit,
                    programId: currentEnrollment?.program,
                    status: currentEnrollment?.status,
                    ownershipOu: teiDetails?.programOwners?.[teiDetails?.programOwners.length - 1]?.orgUnit ??
                        teiDetails?.programOwners?.[0]?.orgUnit,
                } : {
                    programStageEvent: event?.event
                })
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

    for (const event of data) {
        let status
        let absenceOption
        const eventId = event.event
        for (const dataValue of event.dataValues) {
            if (attendanceConfig?.status === dataValue.dataElement) {
                status = dataValue.value
            }

            if (attendanceConfig?.absenceReason === dataValue.dataElement) {
                absenceOption = dataValue.value
            }
        }
        const dateKey = event.occurredAt?.split("T")?.[0]
        if (!dateKey) continue

        // Merge same-day values so status and absence reason can come from different event updates.
        localData[dateKey] = {
            status: status ?? localData?.[dateKey]?.status,
            absenceOption: absenceOption ?? localData?.[dateKey]?.absenceOption,
            eventId: eventId ?? localData?.[dateKey]?.eventId,
        }
    }
    return localData
}
