var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";
const EVENT_QUERY = (queryProps) => {
    var _a;
    return ({
        results: {
            resource: "tracker/events",
            params: Object.assign({ fields: (_a = queryProps === null || queryProps === void 0 ? void 0 : queryProps.fields) !== null && _a !== void 0 ? _a : "*" }, queryProps)
        }
    });
};
const TEI_QUERY = (queryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: Object.assign({ fields: "trackedEntity,createdAt,orgUnit,attributes[attribute,value],enrollments[enrollment,orgUnit,program,status],programOwners[orgUnit]" }, queryProps)
    }
});
export function useTableData() {
    const engine = useDataEngine();
    // const { program, registration } = getDataStoreKeys()
    //const headerFieldsState = useRecoilValue(HeaderFieldsState)
    //const setEvents = useSetRecoilState(EventsState)
    //const { urlParamiters } = useParams()
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    //const { hide, show } = useShowAlerts()
    //const { getDataStoreData } = getSelectedKey()
    //const school = urlParamiters().school as unknown as string
    function getData(tableDataProps) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { page, pageSize, order, program, orgUnit, baseProgramStage, secondaryProgramStages, attributeFilters, dataElementFilters, showAlert, hideAlert } = tableDataProps;
            if (orgUnit !== null) {
                setLoading(true);
                const eventsResults = yield engine.query(EVENT_QUERY({
                    ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                    page,
                    pageSize,
                    program: program,
                    order: order || "occurredAt:desc",
                    programStage: baseProgramStage,
                    filter: dataElementFilters,
                    filterAttributes: attributeFilters,
                    orgUnit: orgUnit
                })).catch((error) => {
                    showAlert({
                        message: `${("Could not get events")}: ${error.message}`,
                        type: { critical: true }
                    });
                    setTimeout(hideAlert, 5000);
                });
                const trackedEntityToFetch = (_a = eventsResults === null || eventsResults === void 0 ? void 0 : eventsResults.results) === null || _a === void 0 ? void 0 : _a.instances.map((x) => x.trackedEntity).toString().replaceAll(",", ";");
                const teiResults = (trackedEntityToFetch === null || trackedEntityToFetch === void 0 ? void 0 : trackedEntityToFetch.length) > 0
                    ? yield engine.query(TEI_QUERY({
                        ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                        pageSize,
                        program: program,
                        trackedEntity: trackedEntityToFetch
                    })).catch((error) => {
                        showAlert({
                            message: `${("Could not get traked entities")}: ${error.message}`,
                            type: { critical: true }
                        });
                        setTimeout(hideAlert, 5000);
                    })
                    : { results: { instances: [] } };
                //setEvents(eventsResults?.results?.instances)
                console.log('eventsInstances:', (_b = eventsResults === null || eventsResults === void 0 ? void 0 : eventsResults.results) === null || _b === void 0 ? void 0 : _b.instances);
                console.log('teiInstances:', (_c = teiResults === null || teiResults === void 0 ? void 0 : teiResults.results) === null || _c === void 0 ? void 0 : _c.instances);
                /* setTableData(formatResponseRows({
                    eventsInstances: eventsResults?.results?.instances as unknown as FormatResponseRowsProps['eventsInstances'],
                    teiInstances: teiResults?.results?.instances as unknown as FormatResponseRowsProps['teiInstances']
                })); */
                setLoading(false);
            }
        });
    }
    return {
        getData,
        tableData,
        loading
    };
}
