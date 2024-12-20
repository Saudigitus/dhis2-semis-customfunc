import { useRecoilValue } from "recoil";
import { formatProgramRuleVariables } from "../../../utils/programRules/formatProgramRules";
import { ProgramRulesVariablesConfigState } from "../../../schema/programRulesVariablesSchema";
export function useFormatProgramRulesVariables() {
    const programRulesVariablesConfigState = useRecoilValue(ProgramRulesVariablesConfigState);
    return {
        programRulesVariables: formatProgramRuleVariables(programRulesVariablesConfigState),
    };
}
