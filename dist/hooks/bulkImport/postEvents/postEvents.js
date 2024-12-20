var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useGetEvents } from "../../events/useGetEvents";
import useUploadEvents from "../../events/useUploadEvents";
import { splitArrayIntoChunks } from "../../../utils/common/splitArray";
import { importSummary } from "../../../utils/common/getImportSummary";
export function postValues({ setStats }) {
    const { uploadValues } = useUploadEvents();
    const { getEvents, error: eventsError } = useGetEvents();
    let updatedStats = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] };
    function postData(data, excelData, importMode, programConfig, programStages) {
        return __awaiter(this, void 0, void 0, function* () {
            let copyData = [...data];
            for (const student of excelData.mapping) {
                const { enrollment, orgUnit, trackedEntity } = student.Ids;
                for (const stage of programStages) {
                    yield getEvents({
                        program: programConfig.id,
                        orgUnit,
                        ouMode: "SELECTED",
                        programStage: stage,
                        fields: "event,programStage,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]",
                        trackedEntity: trackedEntity,
                        skipPaging: true
                    }).then((resp) => {
                        var _a;
                        let event = (_a = resp.find((x) => x.enrollment === enrollment && x.programStage == stage)) === null || _a === void 0 ? void 0 : _a.event;
                        const index = copyData.findIndex(x => x.enrollment === enrollment && x.programStage == stage);
                        copyData[index] = Object.assign(Object.assign({}, copyData[index]), { event: event });
                    });
                }
            }
            const chunks = splitArrayIntoChunks(copyData, 50);
            for (const chunk of chunks) {
                const response = yield uploadValues({ events: chunk }, importMode, importStrategy.UPDATE);
                updatedStats = importSummary(response, updatedStats);
            }
            setStats(updatedStats);
        });
    }
    return { postData };
}
