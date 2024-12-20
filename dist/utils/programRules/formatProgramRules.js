import { PRulesTypes } from "../../types/programRules/FormattedPRules";
export function formatProgramRules(programRules) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const programRulesResponses = [];
    for (const prules of programRules || []) {
        for (const pRulesAction of prules.programRuleActions) {
            programRulesResponses.push({
                condition: prules.condition,
                programRuleActionType: pRulesAction.programRuleActionType,
                variable: ((_a = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.dataElement) === null || _a === void 0 ? void 0 : _a.id) || ((_b = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.trackedEntityAttribute) === null || _b === void 0 ? void 0 : _b.id) || ((_c = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.programStageSection) === null || _c === void 0 ? void 0 : _c.id),
                type: ((_d = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.dataElement) === null || _d === void 0 ? void 0 : _d.id) && PRulesTypes.DATA_ELEMENT || ((_e = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.trackedEntityAttribute) === null || _e === void 0 ? void 0 : _e.id) && PRulesTypes.ATTRIBUTE || ((_f = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.programStageSection) === null || _f === void 0 ? void 0 : _f.id) && PRulesTypes.SECTION,
                content: (_g = prules.content) !== null && _g !== void 0 ? _g : pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.content,
                programStage: (_h = prules === null || prules === void 0 ? void 0 : prules.programStage) === null || _h === void 0 ? void 0 : _h.id,
                data: pRulesAction.data,
                optionGroup: (_j = pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.optionGroup) === null || _j === void 0 ? void 0 : _j.id,
                displayName: pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.displayName,
                id: pRulesAction === null || pRulesAction === void 0 ? void 0 : pRulesAction.id,
                program: (_k = prules === null || prules === void 0 ? void 0 : prules.program) === null || _k === void 0 ? void 0 : _k.id
            });
        }
    }
    return programRulesResponses;
}
export function formatProgramRuleVariables(programRuleVariables) {
    var _a, _b;
    const programRuleVariablesResponses = {};
    for (const pRulesVariable of programRuleVariables || []) {
        programRuleVariablesResponses[pRulesVariable === null || pRulesVariable === void 0 ? void 0 : pRulesVariable.name.trim()] = ((_a = pRulesVariable === null || pRulesVariable === void 0 ? void 0 : pRulesVariable.dataElement) === null || _a === void 0 ? void 0 : _a.id) || ((_b = pRulesVariable === null || pRulesVariable === void 0 ? void 0 : pRulesVariable.trackedEntityAttribute) === null || _b === void 0 ? void 0 : _b.id);
    }
    return programRuleVariablesResponses;
}
