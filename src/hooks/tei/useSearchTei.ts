import { useDataEngine } from "@dhis2/app-runtime";
import { TeiSearchQueryProps } from "../../types/api/WithRegistrationTypes";
import useShowAlerts from "../commons/useShowAlert";

const SEARCH_TEI_QUERY = ({ program, filter, ouMode = "ACCESSIBLE", page, pageSize }: TeiSearchQueryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: {
            fields: "trackedEntity,createdAt,orgUnit,attributes[attribute,value],enrollments[enrollment,enrolledAt],programOwners[orgUnit]",
            ouMode,
            totalPages: true,
            program,
            filter,
            page,
            pageSize
        }
    }
})

export function useSearchTei() {
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts()

    async function getTrackersearch({ program, orgUnit, filters }: { program: string, filters: string, orgUnit?: string }) {
        return await engine.query(SEARCH_TEI_QUERY({
            pageSize: 5,
            page: 1,
            program,
            orgUnit,
            filter: filters.slice(0, -1)
        })).then((resp: any) => {
            return {
                results: { instances: resp?.results?.instances ? resp?.results?.instances : resp?.results?.trackedEntities, ...resp?.results }
            }
        }).catch((error: any) => {
            show({ message: `Occurred error wihile fetching data: ${error}`, type: { critical: true } })
            setTimeout(hide, 5000);
        });

    }

    return { getTrackersearch }
}