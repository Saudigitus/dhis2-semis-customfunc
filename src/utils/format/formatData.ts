import { DataValuesProps } from "../../types/api/WithoutRegistrationTypes"
import { attributesProps } from "../../types/api/WithRegistrationTypes"
import { RowsDataProps } from "../../types/common/FormatRowsDataProps"
import { type AttendanceFormaterProps } from "../../types/attendance/attendaceFormaterProps"
import { selectedDataStoreKey } from "dhis2-semis-types"

export function attributes(data: attributesProps[]): RowsDataProps {
    const localData: RowsDataProps = {}
    for (const attribute of data) {
        localData[attribute.attribute] = attribute.value
    }
    return localData
}

export function dataValues(data: DataValuesProps[], stageId: string): RowsDataProps {
    const localData: RowsDataProps = {}

    for (const dataElement of data) {
        localData[`${stageId}.${dataElement.dataElement}`] = dataElement.value
    }
    return localData
}

export function attendanceFormater(events: AttendanceFormaterProps[], attendanceConfig: selectedDataStoreKey['attendance']): RowsDataProps {
    const localData: RowsDataProps = {}
    let status: string = ""

    for (const event of events) {
        for (const dataValue of event.dataValues) {

            if (attendanceConfig?.status === dataValue.dataElement) {
                status = dataValue.value
            }
        }
    
        localData[event.occurredAt?.split("T")?.[0]] = status
    }

    return localData
}



