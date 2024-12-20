import { modules } from "../../types/common/moduleTypes";
import { attendanceFormater, dataValues } from "./formatData";
export function formatSheetData({ module, stageId, events, dataStore }) {
    let formatedValues = {};
    if (module == modules.attendance) {
        formatedValues = attendanceFormater(events, dataStore.attendance);
    }
    else {
        formatedValues = dataValues(events === null || events === void 0 ? void 0 : events[0].dataValues, stageId);
    }
    return formatedValues;
}
