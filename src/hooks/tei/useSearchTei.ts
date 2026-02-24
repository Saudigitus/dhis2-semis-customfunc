import useShowAlerts from "../commons/useShowAlert";
import { useGetCompleteTeis } from "./useGetCompleteTei";
import { TeiQueryProps } from "../../types/api/WithRegistrationTypes";

export function useSearchTei() {
    const { hide, show } = useShowAlerts()
    const { getCompleteTeis } = useGetCompleteTeis()

    async function getTrackersearch({ program, orgUnit, filters }: { program: string, filters: string, orgUnit?: string }) {
        return await getCompleteTeis({
            pageSize: 5,
            page: 1,
            program,
            orgUnit,
            totalPages: true,
            orgUnitMode: "ACCESSIBLE",
            filter: filters.slice(0, -1),
        } as TeiQueryProps).then((resp: any) => {
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