var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { format } from "date-fns";
import { importSummary } from "../../../utils/common/getImportSummary";
import { splitArrayIntoChunks } from "../../../utils/common/splitArray";
import { useGetEvents } from "../../events/useGetEvents";
import useUploadEvents from "../../events/useUploadEvents";
export function postAttendanceValues({ setStats }) {
    const { uploadValues } = useUploadEvents();
    const { getEvents, error: eventsError } = useGetEvents();
    let updatedStats = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] };
    function postAttendance(events, programStageName, programStageId, excelData, program, importMode) {
        return __awaiter(this, void 0, void 0, function* () {
            let values = { CREATE: [], UPDATE: [] };
            const keys = Object.keys(values);
            for (const student of excelData) {
                const { enrollment, orgUnit, trackedEntity } = student.Ids;
                const days = Object.keys(student[programStageName]);
                const filter = {
                    occurredAfter: days[0],
                    occurredBefore: days[days.length - 1]
                };
                yield getEvents(Object.assign(Object.assign({ program }, filter), { orgUnit, ouMode: "SELECTED", programStage: programStageId, fields: "event,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]", trackedEntity: trackedEntity, skipPaging: true })).then((resp) => {
                    let thisTeiEvents = events.filter(x => x.enrollment === enrollment);
                    let alreadyExistingEvents = {};
                    resp === null || resp === void 0 ? void 0 : resp.filter(x => x.enrollment === enrollment).map((x) => {
                        alreadyExistingEvents[format(new Date(x.occurredAt), 'yyyy-MM-dd')] = x.event;
                    });
                    thisTeiEvents.forEach(event => {
                        if (alreadyExistingEvents[event.occurredAt]) {
                            values.UPDATE.push(Object.assign(Object.assign({}, event), { event: alreadyExistingEvents[event.occurredAt] }));
                        }
                        else {
                            values.CREATE.push(event);
                        }
                    });
                });
            }
            for (const key of keys) {
                const chunks = splitArrayIntoChunks(values[key], 50);
                for (const chunk of chunks) {
                    const response = yield uploadValues({ events: chunk }, importMode, importStrategy[key]);
                    updatedStats = importSummary(response, updatedStats);
                }
            }
            setStats(updatedStats);
        });
    }
    return { postAttendance };
}
