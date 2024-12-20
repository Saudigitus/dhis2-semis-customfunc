import { FormattedPRulesType } from "../../types/programRules/FormattedPRules";
import { ProgramRuleConfig, ProgramRuleVariableConfig } from "../../types/programRules/ProgramRulesTypes";
export declare function formatProgramRules(programRules: ProgramRuleConfig[]): FormattedPRulesType[];
export declare function formatProgramRuleVariables(programRuleVariables: ProgramRuleVariableConfig[]): Record<string, string | undefined>;
