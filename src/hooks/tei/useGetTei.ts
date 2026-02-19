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

export function useGetTeis() {
    const config = useConfig()
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts()
    const { platformVersion } = getSysInfo()
    const minorVersion = Number.parseInt(platformVersion?.split('.')[1]);

    async function getTeis(props: TeiQueryProps) {
        return await engine.query(TEI_QUERY(
            { ...convertTrackerQueryProps({ queryProps: props, apiVersion: minorVersion ?? config.apiVersion }) }
        )).then((resp: any) => {
            return resp.results?.instances ? resp.results?.instances : resp.results?.trackedEntities
        }).catch((error: any) => {
            show({ message: `Occurred error wihile fetching data: ${error}`, type: { critical: true } })
            setTimeout(hide, 5000);
        })
    }

    return { getTeis }
}