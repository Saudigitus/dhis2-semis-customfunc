import { useRecoilState } from "recoil";
import { useEffect, useState } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import useShowAlerts from "../../commons/useShowAlert";
import { ProgramRulesConfigState } from "../../../schema/programRulesSchema";
const PROGRAM_RULES_QUERY = {
    results: {
        resource: "programRules",
        params: ({ programFilter }) => ({
            paging: false,
            filter: programFilter,
            fields: "id,displayName,condition,description,program[id],programStage[id],priority,programRuleActions[id,content,location,data,programRuleActionType,programStageSection[id],dataElement[id],trackedEntityAttribute[id],option[id],optionGroup[id],programIndicator[id],programStage[id]]",
        })
    }
};
export function useGetProgramRules(programs) {
    const { hide, show } = useShowAlerts();
    const [error, setError] = useState(false);
    const [, setProgramRulesConfigState] = useRecoilState(ProgramRulesConfigState);
    const { data, loading: loadingPRules, refetch } = useDataQuery(PROGRAM_RULES_QUERY, {
        variables: {
            programFilter: programs === null || programs === void 0 ? void 0 : programs.map((program) => `program.id:eq:${program}`)
        },
        onError(error) {
            show({
                message: `${("Could not get program rules")}: ${error === null || error === void 0 ? void 0 : error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
            setError(true);
        },
        onComplete(response) {
            var _a;
            setProgramRulesConfigState((_a = response === null || response === void 0 ? void 0 : response.results) === null || _a === void 0 ? void 0 : _a.programRules);
        },
        lazy: true
    });
    useEffect(() => {
        void refetch();
    }, []);
    return { loadingPRules, refetch, errorPRules: error };
}
