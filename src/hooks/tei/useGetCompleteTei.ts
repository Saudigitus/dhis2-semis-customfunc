import useShowAlerts from "../commons/useShowAlert";
import { useConfig, useDataEngine } from "@dhis2/app-runtime";
import { type TeiQueryProps } from "../../types/api/WithRegistrationTypes";
import { convertTrackerQueryProps } from "../../utils/tracker-migration/trackersParamsMapping";
import { getSysInfo } from "../system/getSysInfo";

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
    const { platformVersion } = getSysInfo()
    const minorVersion = Number.parseInt(platformVersion?.split('.')[1]);

    async function getCompleteTeis(props: TeiQueryProps) {
        return await engine.query(TEI_QUERY(
            { ...convertTrackerQueryProps({ queryProps: props, apiVersion: minorVersion ?? config.apiVersion }) }
        ))
    }

    return { getCompleteTeis }
}