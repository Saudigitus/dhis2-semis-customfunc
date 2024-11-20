import { useRecoilValue } from "recoil";
import { ProgramRulesConfigState } from "../../../schema/programRulesSchema";
import { formatProgramRules } from "../../../utils/programRules/formatProgramRules";

export function useFormatProgramRules() {
    const programRulesConfigState = useRecoilValue(ProgramRulesConfigState)

    console.log(formatProgramRules(programRulesConfigState), "lena")
    return {
        programRules: formatProgramRules(programRulesConfigState),
    }
}
