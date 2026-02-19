import useShowAlerts from "../commons/useShowAlert";
import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { type TeiQueryProps } from "../../types/api/WithRegistrationTypes";
import { convertTrackerQueryProps } from "../../utils/tracker-migration/trackersParamsMapping";

const TEI_QUERY = (queryProps: TeiQueryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: {
            fields: "trackedEntity,createdAt,orgUnit,attributes[attribute,value],enrollments[enrollment,orgUnit,program,status],programOwners[orgUnit]",
            ...queryProps
        }
    }
})

export function useGetCompleteTeis() {
    const config = useConfig()
    const engine = useDataEngine();

    async function getCompleteTeis(props: TeiQueryProps) {
        return await engine.query(TEI_QUERY(
            { ...convertTrackerQueryProps({ queryProps: props, apiVersion: config.apiVersion }) }
        ))
    }

    return { getCompleteTeis }
}