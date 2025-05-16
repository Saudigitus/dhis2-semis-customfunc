import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../../commons/useShowAlert";
import { ProgramRulesVariablesConfigState } from "../../../schema/programRulesVariablesSchema";
import { ProgramRuleVariableConfig } from "../../../types/programRules/ProgramRulesTypes";

const PROGRAM_RULES_VARIABLES_QUERY = {
    results: {
        resource: "programRuleVariables",
        params: ({ programFilter }: any) => ({
            paging: false,
            filter: programFilter,
            fields: "name,dataElement,trackedEntityAttribute,program[id]",

        })
    }
}

type ProgramRulesVariablesQueryResponse = {
    results: {
        programRuleVariables: ProgramRuleVariableConfig[]
    }
}

export function useGetProgramRulesVariables(programs: string[]) {
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState<boolean>(false)
    const [, setProgramRuleVariablesConfigState] = useRecoilState(ProgramRulesVariablesConfigState);

    const { data, loading: loadingPRulesVariables, refetch } = useDataQuery<ProgramRulesVariablesQueryResponse>(PROGRAM_RULES_VARIABLES_QUERY, {
        variables: {
            programFilter: `program.id:in:[${programs.join(",")}]`
        },
        onError(error: { message: string }) {
            show({
                message: `${("Could not get program rules variables")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true)
        },
        onComplete(response: { results: { programRuleVariables: any[] } }) {
            setProgramRuleVariablesConfigState(response?.results?.programRuleVariables);
        },
        lazy: true
    })

    useEffect(() => {
        void refetch()
    }, [])

    return { loadingPRulesVariables, refetch, errorPRulesVariables: error }
}
