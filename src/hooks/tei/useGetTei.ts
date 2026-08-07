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
            ...queryProps,
        },
    },
});

export function useGetTeis() {
    const config = useConfig();
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts();
    const { platformVersion } = getSysInfo();
    const minorVersion = Number.parseInt(platformVersion?.split(".")[1]);

    async function getTeis(props: TeiQueryProps) {
        let teis: any[] = [];
        let page = 1;
        const pageSize = Number(props?.pageSize ?? 50);
        let currentPageData: any[] = [];

        try {
            do {
                const resp: any = await engine.query(
                    TEI_QUERY({
                        ...convertTrackerQueryProps({
                            queryProps: {
                                ...props,
                                page,
                                pageSize,
                            },
                            apiVersion: minorVersion ?? config.apiVersion,
                        }),
                    })
                );

                currentPageData =
                    resp.results?.instances ??
                    resp.results?.trackedEntities ??
                    [];

                teis = [...teis, ...currentPageData];
                page++;
            } while (currentPageData.length === pageSize);

            return teis;
        } catch (error: any) {
            show({
                message: `Occurred error while fetching data: ${error}`,
                type: { critical: true },
            });
            setTimeout(hide, 5000);
            return [];
        }
    }

    return { getTeis };
}