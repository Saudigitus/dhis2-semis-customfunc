import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { OrgUnitsGroupsConfig, OrgUnitsGroupsConfigState } from "../../schema/orgUnitsGroupSchema";

const OPTION_GROUPS_QUERY = {
    results: {
        resource: "organisationUnitGroups",
        params: {
            fields: "code~rename(value),displayName~rename(label),organisationUnits[id~rename(value),displayName~rename(label)]",
            paging: false

        }
    }
}

type OrgUnitGroupsQueryResponse = {
    results: {
        organisationUnitGroups: OrgUnitsGroupsConfig[]
    }
}

export function useOrgUnitsGroups():any {
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState<boolean>(false)
    const [, setOrgUnitsGroupsConfigState] = useRecoilState(OrgUnitsGroupsConfigState);

    const { data, loading: loadingOrgUnitsGroups, refetch } = useDataQuery<OrgUnitGroupsQueryResponse>(OPTION_GROUPS_QUERY, {
        onError(error: { message: string }) {
            show({
                message: `${("Could not get organisation units groups")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true)
        },
        onComplete(response: { results: { organisationUnitGroups: any[] } }) {
            setOrgUnitsGroupsConfigState(response?.results?.organisationUnitGroups);
        },
        lazy: true
    })

    useEffect(() => {
        void refetch()
    }, [])

    return { loadingOrgUnitsGroups, refetch, errorOrgUnitsGroups: error }
}
