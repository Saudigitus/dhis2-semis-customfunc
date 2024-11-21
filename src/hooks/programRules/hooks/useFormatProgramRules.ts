import { useRecoilValue } from "recoil";
import { ProgramRulesConfigState } from "../../../schema/programRulesSchema";
import { formatProgramRules } from "../../../utils/programRules/formatProgramRules";

export function useFormatProgramRules() {
    const programRulesConfigState = useRecoilValue(ProgramRulesConfigState)

    return {
        programRules: formatProgramRules(programRulesConfigState),
    }
}
