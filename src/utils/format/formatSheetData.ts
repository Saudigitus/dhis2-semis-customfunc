import { ExportData } from "../../types/bulk/bulkOperations"
import { Modules } from "dhis2-semis-types"
import { selectedDataStoreKey } from "dhis2-semis-types"
import { attendanceFormater, dataValues } from "./formatData"

export function formatSheetData({ module, stageId, events, dataStore }: { module: ExportData['module'], stageId: string, events: any[], dataStore: selectedDataStoreKey }) {
    let formatedValues = {}

    if (module == Modules.Attendance) {
        formatedValues = attendanceFormater(events, dataStore.attendance)
    } else {
        formatedValues = dataValues(events?.[0].dataValues, stageId)
    }

    return formatedValues
}