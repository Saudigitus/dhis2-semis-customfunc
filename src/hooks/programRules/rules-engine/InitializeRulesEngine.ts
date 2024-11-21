import { useRecoilState } from "recoil"
import { useFormatProgramRules } from "../hooks/useFormatProgramRules"
import { ProgramRulesFormatedState } from "../../../schema/programRulesFormated"
import { FormattedPRulesType } from "../../../types/programRules/FormattedPRules"
import { useFormatProgramRulesVariables } from "../hooks/useFormatProgramRulesVariables"
import { getFunctionExpression, removeSpecialCharacters, replaceConditionVariables } from "./RulesEngine"

/**
 * The program rules values formatter.
 * @returns {{ initialize: () => void }} A method for triggering the program rules variable formatter.
 */
export const initializeRulesEngine = () => {
    const { programRules } = useFormatProgramRules()
    const { programRulesVariables } = useFormatProgramRulesVariables()
    const [newProgramRules, setNewProgramRules] = useRecoilState(ProgramRulesFormatedState)

    function initialize() {
        if (programRules?.length && Object.keys(programRulesVariables)?.length && newProgramRules?.length === 0) {
            const newProgramRule: FormattedPRulesType[] = programRules
                .map((programRule: FormattedPRulesType) => {
                    return {
                        ...programRule,
                        functionName: getFunctionExpression(programRule.condition),
                        data: replaceConditionVariables(removeSpecialCharacters(programRule?.data), programRulesVariables),
                        condition: replaceConditionVariables(removeSpecialCharacters(programRule?.condition), programRulesVariables),
                    }
                })
            setNewProgramRules(newProgramRule)
        }
    }

    return { initialize }
}