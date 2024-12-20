import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { OrgUnitsGroupsConfigState } from "../../schema/orgUnitsGroupSchema";
const OPTION_GROUPS_QUERY = {
    results: {
        resource: "organisationUnitGroups",
        params: {
            fields: "code~rename(value),displayName~rename(label),organisationUnits[id~rename(value),displayName~rename(label)]",
            paging: false
        }
    }
};
export function useOrgUnitsGroups() {
    const { hide, show } = useShowAlerts();
    const [error, setError] = useState(false);
    const [, setOrgUnitsGroupsConfigState] = useRecoilState(OrgUnitsGroupsConfigState);
    const { data, loading: loadingOrgUnitsGroups, refetch } = useDataQuery(OPTION_GROUPS_QUERY, {
        onError(error) {
            show({
                message: `${("Could not get organisation units groups")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true);
        },
        onComplete(response) {
            var _a;
            setOrgUnitsGroupsConfigState((_a = response === null || response === void 0 ? void 0 : response.results) === null || _a === void 0 ? void 0 : _a.organisationUnitGroups);
        },
        lazy: true
    });
    useEffect(() => {
        void refetch();
    }, []);
    return { loadingOrgUnitsGroups, refetch, errorOrgUnitsGroups: error };
}
