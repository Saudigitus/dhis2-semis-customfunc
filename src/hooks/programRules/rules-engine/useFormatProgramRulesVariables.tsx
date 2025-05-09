import { useRecoilValue } from "recoil";
import { ProgramRulesVariablesConfigState } from "src/schema/programRulesVariablesSchema";
import { formatProgramRuleVariables } from "src/utils/programRules/formatProgramRules";


export function useFormatProgramRulesVariables(program: string) {
    const programRulesVariablesConfigState = useRecoilValue(ProgramRulesVariablesConfigState);

    return {
        programRulesVariables: formatProgramRuleVariables(programRulesVariablesConfigState, program),
    }
}