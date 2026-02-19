import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { EventQueryProps } from "../../types/api/WithoutRegistrationTypes";
import { convertEventQueryProps, } from "../../utils/tracker-migration/eventsParamsMapping";

const EVENT_QUERY = (queryProps: EventQueryProps) => ({
    results: {
        resource: "tracker/events",
        params: {
            fields: queryProps?.fields ?? "*",
            ...queryProps
        }
    }
})

export function useGetCompleteEvents() {
    const config = useConfig()
    const engine = useDataEngine()

    async function getCompleteEvents(props: EventQueryProps): Promise<any> {
        return await engine.query(EVENT_QUERY(
            { ...convertEventQueryProps({ queryProps: props, apiVersion: config.apiVersion }) }
        ))
    }

    return { getCompleteEvents }
}