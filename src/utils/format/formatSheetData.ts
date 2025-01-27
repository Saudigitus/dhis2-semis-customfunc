import { ExportData } from "../../types/bulk/bulkOperations"
import { modules } from "../../types/common/moduleTypes"
import { selectedDataStoreKey } from "dhis2-semis-types"
import { attendanceFormater, dataValues } from "./formatData"

export function formatSheetData({ module, stageId, events, dataStore }: { module: ExportData['module'], stageId: string, events: any[], dataStore: selectedDataStoreKey }) {
    let formatedValues = {}

    if (module == modules.attendance) {
        formatedValues = attendanceFormater(events, dataStore.attendance)
    } else {
        formatedValues = dataValues(events?.[0].dataValues, stageId)
    }

    return formatedValues
}