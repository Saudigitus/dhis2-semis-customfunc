import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { OptionGroupsConfig, OptionGroupsConfigState } from "../../schema/optionGroupsSchema";

const OPTION_GROUPS_QUERY = {
    results: {
        resource: "optionGroups",
        params: {
            fields: "id,options[code~rename(value),displayName~rename(label)]",
            paging: false

        }
    }
}

type OptionGroupsQueryResponse = {
    results: {
        optionGroups: OptionGroupsConfig[]
    }
}

export function useGetOptionGroups():any {
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState<boolean>(false)
    const [, setOptionGroupsConfigState] = useRecoilState(OptionGroupsConfigState);

    const { data, loading: loadingOptionGroups, refetch } = useDataQuery<OptionGroupsQueryResponse>(OPTION_GROUPS_QUERY, {
        onError(error: { message: string }) {
            show({
                message: `${("Could not get option groups")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true)
        },
        onComplete(response: { results: { optionGroups: any[] } }) {
            setOptionGroupsConfigState(response?.results?.optionGroups);
        },
        lazy: true
    })

    useEffect(() => {
        void refetch()
    }, [])

    return { loadingOptionGroups, refetch: () => refetch().then(() => {}), errorOptionGroups: error }
}
