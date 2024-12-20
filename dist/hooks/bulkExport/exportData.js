var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState } from 'react';
import { isDateFormatValid } from "../../utils/format/checkDateFormat";
import { useGetEvents } from "../events/useGetEvents";
import { formatSheetData } from "../../utils/format/formatSheetData";
import { getMetaData } from '../../utils/excelMetadata/getMetadata';
import { generateHeaders } from './excelHeaders/generateExcelHeaders';
import { getCommonSheetData } from './useGetCommonData/commonData';
import { gererateFile } from './dataExporter/fileGenerator';
import { modules } from '../../types/common/moduleTypes';
import { genarateEmpttyRows } from '../../utils/common/generateData';
import { generateAndReserveIds } from './generateIds/generateAndReserve';
export function useExportData(props) {
    const [error, setError] = useState(null);
    const { getData } = getCommonSheetData(props);
    const { getEvents, error: eventsError } = useGetEvents();
    const { generate } = generateAndReserveIds();
    const { numberOfEmpyRows = 25, programConfig, fileName, isSchoolDay, orgUnit, stagesToExport, module, endDate, startDate, seletedSectionDataStore = {}, withSocioEconomics = false, sectionType, empty = false, orgUnitName } = props;
    const { excelGenerator } = gererateFile({ unavailableDays: isSchoolDay });
    const { getHeaders } = generateHeaders({
        module,
        programConfig,
        stagesToExport,
        seletedSectionDataStore,
        sectionType,
        withSocioEconomics,
        endDate,
        startDate,
        empty
    });
    function exportData() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (module === modules.attendance &&
                (!isDateFormatValid(endDate)
                    || !isDateFormatValid(startDate))) {
                setError('The date format is not correct, the expected date format is: yyyy-MM-dd');
            }
            else {
                let data = [];
                const { filters, formatedHeaders, toGenerate, defaultLockedHeaders } = getHeaders();
                const metadata = getMetaData(programConfig, stagesToExport);
                if (!empty) {
                    data = yield getData();
                    if (module != modules.enrollment) {
                        for (let teisCounter = 0; teisCounter < data.length; teisCounter++) {
                            for (let a = 0; a < stagesToExport.length; a++) {
                                yield getEvents(Object.assign(Object.assign({ program: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.program }, (module === modules.attendance ? {
                                    occurredAfter: startDate,
                                    occurredBefore: endDate
                                } : {})), { orgUnit, ouMode: "SELECTED", programStage: stagesToExport[a], fields: "event,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]", trackedEntity: data[teisCounter].trackedEntity, skipPaging: true })).then((resp) => {
                                    const events = resp === null || resp === void 0 ? void 0 : resp.filter((x) => x.enrollment === data[teisCounter].enrollment);
                                    data[teisCounter] = Object.assign(Object.assign({}, data[teisCounter]), formatSheetData({
                                        module: module,
                                        stageId: stagesToExport[a],
                                        events: events,
                                        dataStore: seletedSectionDataStore
                                    }));
                                }).catch((error) => {
                                    setError(error);
                                });
                            }
                        }
                    }
                }
                else if (empty && module == modules.enrollment) {
                    let ids = {};
                    for (const idToGenerate of toGenerate) {
                        const generatedIds = yield generate(numberOfEmpyRows, idToGenerate);
                        ids[idToGenerate] = (_a = generatedIds === null || generatedIds === void 0 ? void 0 : generatedIds.result) === null || _a === void 0 ? void 0 : _a.map((x) => x.value);
                    }
                    data = genarateEmpttyRows(numberOfEmpyRows, formatedHeaders, ids, orgUnitName);
                }
                else {
                    setError('empty só é aplicavel para o módulo do enrollment!');
                }
                yield excelGenerator({ headers: formatedHeaders, rows: data, filters, fileName, metadata, module, empty, defaultLockedHeaders });
            }
        });
    }
    return { exportData, error: error !== null && error !== void 0 ? error : eventsError };
}
