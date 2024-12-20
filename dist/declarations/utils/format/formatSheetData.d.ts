import { ExportData } from "../../types/bulk/bulkOperations";
import { DataStoreRecord } from "../../types/dataStore/DataStoreConfig";
export declare function formatSheetData({ module, stageId, events, dataStore }: {
    module: ExportData['module'];
    stageId: string;
    events: any[];
    dataStore: DataStoreRecord;
}): {};
