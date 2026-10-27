import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ProgramRulesConfigState } from '../../../schema/programRulesSchema';
import { ProgramRulesVariablesConfigState } from '../../../schema/programRulesVariablesSchema';
import { OptionGroupsConfigState } from '../../../schema/optionGroupsSchema';
import { OrgUnitsGroupsConfigState } from '../../../schema/orgUnitsGroupSchema';
import { evaluateProgramRules, EvaluationInput } from './adapter';
import { RuleSupplementaryState } from '../../../schema/ruleSupplementarySchema';

type Props = Pick<EvaluationInput, 'program' | 'variables' | 'values' | 'type' | 'context'>;

/** Compatibility hook for SEMIS forms. Expressions are evaluated by DHIS2. */
export const useDhis2RulesEngine = (props: Props) => {
    const rules = useRecoilValue(ProgramRulesConfigState);
    const ruleVariables = useRecoilValue(ProgramRulesVariablesConfigState);
    const optionGroups = useRecoilValue(OptionGroupsConfigState);
    const orgUnitGroups = useRecoilValue(OrgUnitsGroupsConfigState);
    const supplementary = useRecoilValue(RuleSupplementaryState);
    const [result, setResult] = useState({ updatedVariables: props.variables, updatedValues: props.values, effects: [] as any[] });
    const [error, setError] = useState<Error | null>(null);

    function runRulesEngine(overrides?: { overrideVariables?: any[]; overrideValues?: Record<string, any> }) {
        try {
            const next = evaluateProgramRules({ ...props, rules, ruleVariables, optionGroups, orgUnitGroups,
                context: { ...supplementary, ...props.context },
                variables: overrides?.overrideVariables ?? props.variables,
                values: overrides?.overrideValues ?? props.values });
            setResult(next);
            setError(null);
            return next;
        } catch (cause) {
            const failure = cause instanceof Error ? cause : new Error(String(cause));
            setError(failure);
            console.error('Could not evaluate program rules', failure);
            return undefined;
        }
    }

    const inputKey = JSON.stringify([props, rules, ruleVariables, optionGroups, orgUnitGroups, supplementary]);
    useEffect(() => { runRulesEngine(); }, [inputKey]);
    return { runRulesEngine, ...result, error };
};
