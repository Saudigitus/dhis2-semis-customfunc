import { FormatResponseRowsProps, RowsDataProps } from "../../../types/common/FormatRowsDataProps";
import { dataValuesProps } from "../../../types/events/eventsProps";
import { attributesProps } from "../../../types/tei/teiProps";


export function formatRowsData({ registrationInstances, teiInstances, options }: FormatResponseRowsProps): RowsDataProps[] {
    const allRows: RowsDataProps[] = [];

    for (const event of registrationInstances ?? []) {
        const teiDetails = teiInstances?.find(tei => tei.trackedEntity === event.trackedEntity);

        allRows.push({
            ...dataValues(event.dataValues, options),
            ...(attributes((teiDetails?.attributes) ?? [], options)),
            trackedEntity: event.trackedEntity,
            enrollmentId: event?.enrollment,
            registrationEvent: event?.event,
            registrationEventOccurredAt: event?.occurredAt ?? "",
            orgUnitId: teiDetails?.enrollments?.[0]?.orgUnit,
            programId: teiDetails?.enrollments?.[0]?.program,
            status: teiDetails?.enrollments?.[0]?.status,
            ownershipOu: teiDetails?.programOwners?.[0]?.orgUnit,
        });
    }

    return allRows;
}

export function dataValues(data: dataValuesProps[], options: any): RowsDataProps {
    const localData: RowsDataProps = {};
    for (const dataElement of data) {
        localData[dataElement.dataElement] = options[dataElement.value] ?? dataElement.value;
    }
    return localData;
}

export function attributes(data: attributesProps[], options: any): RowsDataProps {
    const localData: RowsDataProps = {};
    for (const attribute of data) {
        localData[attribute.attribute] = options[attribute.value] ?? attribute.value;
    }
    return localData;
}
