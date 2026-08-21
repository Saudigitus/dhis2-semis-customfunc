import useShowAlerts from "../commons/useShowAlert";
// import { EventQueryProps } from "dhis2-semis-types";
import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { EventQueryProps } from "../../types/api/WithoutRegistrationTypes";
import { convertEventQueryProps, } from "../../utils/tracker-migration/eventsParamsMapping";
import { getSysInfo } from "../system/getSysInfo";

const EVENT_QUERY = (queryProps: EventQueryProps) => ({
    results: {
        resource: "tracker/events",
        params: {
            fields: queryProps?.fields ?? "*",
            ...queryProps
        }
    }
})



export function useGetEvents() {
    const config = useConfig()
    const engine = useDataEngine()
    const { hide, show } = useShowAlerts()
    const { platformVersion } = getSysInfo()
    const minorVersion = Number.parseInt(platformVersion?.split('.')[1]);

    async function getEvents(props: EventQueryProps): Promise<any> {
        return await engine.query(EVENT_QUERY(
            { ...convertEventQueryProps({ queryProps: props, apiVersion: minorVersion ?? config.apiVersion }) }
        )).then((resp: any) => {
            return resp.results?.instances ?
                props?.totalPages ? { pagination: resp.results?.pager, events: resp.results?.instances } : resp.results?.instances :
                props?.totalPages ? { pagination: resp.results?.pager, events: resp.results?.events } : resp.results?.events
        }).catch((error: any) => {
            show({ message: `Occurred error wihile fetching data: ${error}`, type: { critical: true } })
            setTimeout(hide, 5000);
        })
    }

    return { getEvents }
}