import { useRecoilValue } from "recoil";
import { formatProgramRuleVariables } from "../../../utils/programRules/formaters";
import { ProgramRulesVariablesConfigState } from "../../../schema/programRulesVariablesSchema";

export function useFormatProgramRulesVariables() {
    const programRulesVariablesConfigState = useRecoilValue(ProgramRulesVariablesConfigState);

    return {
        programRulesVariables: formatProgramRuleVariables(programRulesVariablesConfigState),
    }
}