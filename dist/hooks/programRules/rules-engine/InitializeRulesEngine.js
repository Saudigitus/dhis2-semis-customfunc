import { useRecoilState } from "recoil";
import { useFormatProgramRules } from "../hooks/useFormatProgramRules";
import { ProgramRulesFormatedState } from "../../../schema/programRulesFormated";
import { useFormatProgramRulesVariables } from "../hooks/useFormatProgramRulesVariables";
import { getFunctionExpression, removeSpecialCharacters, replaceConditionVariables } from "./RulesEngine";
/**
 * The program rules values formatter.
 * @returns {{ initialize: () => void }} A method for triggering the program rules variable formatter.
 */
export const initializeRulesEngine = () => {
    const { programRules } = useFormatProgramRules();
    const { programRulesVariables } = useFormatProgramRulesVariables();
    const [newProgramRules, setNewProgramRules] = useRecoilState(ProgramRulesFormatedState);
    function initialize() {
        var _a;
        if ((programRules === null || programRules === void 0 ? void 0 : programRules.length) && ((_a = Object.keys(programRulesVariables)) === null || _a === void 0 ? void 0 : _a.length) && (newProgramRules === null || newProgramRules === void 0 ? void 0 : newProgramRules.length) === 0) {
            const newProgramRule = programRules
                .map((programRule) => {
                return Object.assign(Object.assign({}, programRule), { functionName: getFunctionExpression(programRule.condition), data: replaceConditionVariables(removeSpecialCharacters(programRule === null || programRule === void 0 ? void 0 : programRule.data), programRulesVariables), condition: replaceConditionVariables(removeSpecialCharacters(programRule === null || programRule === void 0 ? void 0 : programRule.condition), programRulesVariables) });
            });
            setNewProgramRules(newProgramRule);
        }
    }
    return { initialize };
};
