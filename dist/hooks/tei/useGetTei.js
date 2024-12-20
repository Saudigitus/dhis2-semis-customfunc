var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useDataEngine } from "@dhis2/app-runtime";
const TEI_QUERY = (queryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: Object.assign({ fields: "trackedEntity,occuredAt,createdAt,orgUnit,attributes[attribute,value]" }, queryProps)
    }
});
export function useGetTei() {
    const engine = useDataEngine();
    function getTei(program, trackedEntity) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield engine.query(TEI_QUERY({
                paging: false,
                program: program,
                trackedEntity: trackedEntity
            }));
        });
    }
    return { getTei };
}
