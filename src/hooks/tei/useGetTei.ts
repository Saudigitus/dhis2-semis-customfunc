import { useDataEngine } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { type TeiQueryProps } from "../../types/api/WithRegistrationTypes";

const TEI_QUERY = (queryProps: TeiQueryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: {
            fields: "trackedEntity,occuredAt,createdAt,orgUnit,attributes[attribute,value],enrollments[enrollment,status],",
            ...queryProps
        }
    }
})

export function useGetTeis() {
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts()

    async function getTeis(props: TeiQueryProps) {
        return await engine.query(TEI_QUERY(
            { ...props }
        )).then((resp: any) => {
            return resp.results?.instances ? resp.results?.instances : resp.results?.trackedEntities
        }).catch((error: any) => {
            show({ message: `Occurred error wihile fetching data: ${error}`, type: { critical: true } })
            setTimeout(hide, 5000);
        })
    }

    return { getTeis }
}