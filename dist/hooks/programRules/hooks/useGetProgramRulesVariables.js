import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../../commons/useShowAlert";
import { ProgramRulesVariablesConfigState } from "../../../schema/programRulesVariablesSchema";
const PROGRAM_RULES_VARIABLES_QUERY = {
    results: {
        resource: "programRuleVariables",
        params: ({ programFilter }) => ({
            paging: false,
            filter: programFilter,
            fields: "name,dataElement,trackedEntityAttribute,program[id]",
        })
    }
};
export function useGetProgramRulesVariables(programs) {
    const { hide, show } = useShowAlerts();
    const [error, setError] = useState(false);
    const [, setProgramRuleVariablesConfigState] = useRecoilState(ProgramRulesVariablesConfigState);
    const { data, loading: loadingPRulesVariables, refetch } = useDataQuery(PROGRAM_RULES_VARIABLES_QUERY, {
        variables: {
            programFilter: programs === null || programs === void 0 ? void 0 : programs.map((program) => `program.id:eq:${program}`)
        },
        onError(error) {
            show({
                message: `${("Could not get program rules variables")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true);
        },
        onComplete(response) {
            var _a;
            setProgramRuleVariablesConfigState((_a = response === null || response === void 0 ? void 0 : response.results) === null || _a === void 0 ? void 0 : _a.programRuleVariables);
        },
        lazy: true
    });
    useEffect(() => {
        void refetch();
    }, []);
    return { loadingPRulesVariables, refetch, errorPRulesVariables: error };
}
