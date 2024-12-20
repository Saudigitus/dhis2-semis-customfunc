import { useRecoilValue } from "recoil";
import { formatProgramRules } from "../../../utils/programRules/formaters";
import { ProgramRulesConfigState } from "../../../schema/programRulesSchema";

export function useFormatProgramRules() {
    const programRulesConfigState = useRecoilValue(ProgramRulesConfigState)

    return {
        programRules: formatProgramRules(programRulesConfigState),
    }
}
