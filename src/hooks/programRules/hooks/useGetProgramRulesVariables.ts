import { ProgramRulesVariablesConfigState } from '../../../schema/programRulesVariablesSchema';
import { useRulesMetadata } from './useRulesMetadata';

const fields = 'name,programRuleVariableSourceType,useNameForOptionSet,programStage[id],dataElement[id,valueType,optionSet[options[code,displayName]]],trackedEntityAttribute[id,valueType,optionSet[options[code,displayName]]],program[id]';

export function useGetProgramRulesVariables(programs: string[]) {
    const { loading, error, refetch } = useRulesMetadata(programs, 'programRuleVariables', fields, ProgramRulesVariablesConfigState);
    return { loadingPRulesVariables: loading, errorPRulesVariables: error, refetch };
}
