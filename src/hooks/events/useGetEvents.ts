import { type EventQueryProps } from "../../types/api/WithoutRegistrationTypes";
import { useDataEngine } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";

const EVENT_QUERY = (queryProps: EventQueryProps) => ({
    results: {
        resource: "tracker/events",
        params: {
            ...queryProps
        }
    }
})

export function useGetEvents() {
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts()

    async function getEvents(props: EventQueryProps): Promise<any> {

        return await engine.query(EVENT_QUERY(
            { ...props }
        )).then((resp: any) => {
            return resp.results?.instances
        }).catch((error: any) => {
            show({ message: `Occurred error wihile fetching data: ${error}`, type: { critical: true } })
            setTimeout(hide, 5000);
        })
    }

    return { getEvents }
}
