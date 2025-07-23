import { useDataEngine } from "@dhis2/app-runtime";
import { type TeiQueryResults, type TeiQueryProps } from "../../types/api/WithRegistrationTypes";

const TEI_QUERY = (queryProps: TeiQueryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: {
            fields: "trackedEntity,occuredAt,createdAt,orgUnit,attributes[attribute,value]",
            ...queryProps
        }
    }
})

export function useGetTei() {
    const engine = useDataEngine();

    async function getTei(program: string, trackedEntity: string[], orgUnit?: string) {
        return await engine.query(TEI_QUERY({
            paging: false,
            program: program,
            trackedEntity: trackedEntity,
            orgUnit
        })) as unknown as TeiQueryResults
    }

    return { getTei }
}