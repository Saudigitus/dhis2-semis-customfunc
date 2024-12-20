var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useGetEvents } from "../../events/useGetEvents";
import useUploadEvents from "../../events/useUploadEvents";
import { splitArrayIntoChunks } from "../../../utils/common/splitArray";
import { importSummary } from "../../../utils/common/getImportSummary";
export function postEnrollmentData({ setStats }) {
    const { getEvents, error: eventsError } = useGetEvents();
    const { uploadValues } = useUploadEvents();
    function postEnrollments(enrollments, excelData, importMode, program, updating, dataStore, orgUnit) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let copyData = [...enrollments], updatedStats = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] };
            if (updating) {
                const teis = excelData.map(x => {
                    return { tei: x.Ids.trackedEntity, orgUnit: x.Ids.orgUnit, enrollment: x.Ids.enrollment };
                });
                for (let index = 0; index < teis.length; index++) {
                    yield getEvents({
                        program,
                        orgUnit: (_a = teis[index]) === null || _a === void 0 ? void 0 : _a.orgUnit,
                        ouMode: "SELECTED",
                        programStage: dataStore["socio-economics"].programStage,
                        fields: "event,trackedEntity,enrollment,dataValues[dataElement,value]",
                        trackedEntity: (_b = teis[index]) === null || _b === void 0 ? void 0 : _b.tei,
                        skipPaging: true
                    }).then((resp) => {
                        var _a, _b;
                        let thisTeiEvent = resp.find(x => x.enrollment === copyData[index].enrollment);
                        const _c = copyData[index], { attributes } = _c, rest = __rest(_c, ["attributes"]);
                        copyData[index] = {
                            orgUnit: (_a = teis[index]) === null || _a === void 0 ? void 0 : _a.orgUnit,
                            trackedEntity: (_b = teis[index]) === null || _b === void 0 ? void 0 : _b.tei,
                            trackedEntityType: dataStore.trackedEntityType,
                            attributes: attributes,
                            enrollments: [Object.assign(Object.assign({}, rest), { events: [...(thisTeiEvent ? [Object.assign(Object.assign({}, copyData[index].events[0]), { event: thisTeiEvent.event })] : [])] })]
                        };
                    });
                }
            }
            else {
                for (let index = 0; index < copyData.length; index++) {
                    const props = __rest(copyData[index], []);
                    copyData[index] = {
                        trackedEntityType: dataStore.trackedEntityType,
                        orgUnit: orgUnit,
                        enrollments: [Object.assign({}, props)]
                    };
                }
            }
            const chunks = splitArrayIntoChunks(copyData, 50);
            for (const chunk of chunks) {
                const response = yield uploadValues({ trackedEntities: chunk }, importMode, importStrategy.CREATE);
                updatedStats = importSummary(response, updatedStats);
            }
            setStats(updatedStats);
        });
    }
    return { postEnrollments };
}
