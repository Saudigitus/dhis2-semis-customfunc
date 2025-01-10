import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { OptionGroupsConfig, OptionGroupsConfigState } from "../../schema/optionGroupsSchema";
import { useDataEngine } from "@dhis2/app-runtime";

const OPTION_GROUPS_QUERY = {
    results: {
        resource: "options",
        params: {
            fields: "code,displayName,id",
            paging: false,
            skipPaging: true
        }
    }
}

export function useGetOptions() {
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState<boolean>(false)
    const engine = useDataEngine();

    async function getOptions() {
        return await engine.query(OPTION_GROUPS_QUERY)
            .then((response: any) => {
                let options = {}
                response?.results?.options.map((option: any) => {
                    options = { ...options, [option.code]: option.displayName }
                })

                return options
            })
            .catch((error: any) => {
                show({
                    message: `${("Could not get option groups")}: ${error.message}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
                setError(true)
            })
    }

    return { getOptions }
}
