import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { OptionGroupsConfigState } from "../../schema/optionGroupsSchema";
const OPTION_GROUPS_QUERY = {
    results: {
        resource: "optionGroups",
        params: {
            fields: "id,options[code~rename(value),displayName~rename(label)]",
            paging: false
        }
    }
};
export function useGetOptionGroups() {
    const { hide, show } = useShowAlerts();
    const [error, setError] = useState(false);
    const [, setOptionGroupsConfigState] = useRecoilState(OptionGroupsConfigState);
    const { data, loading: loadingOptionGroups, refetch } = useDataQuery(OPTION_GROUPS_QUERY, {
        onError(error) {
            show({
                message: `${("Could not get option groups")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true);
        },
        onComplete(response) {
            var _a;
            setOptionGroupsConfigState((_a = response === null || response === void 0 ? void 0 : response.results) === null || _a === void 0 ? void 0 : _a.optionGroups);
        },
        lazy: true
    });
    useEffect(() => {
        void refetch();
    }, []);
    return { loadingOptionGroups, refetch, errorOptionGroups: error };
}
