import { ProgramRulesConfigState } from '../../../schema/programRulesSchema';
import { useRulesMetadata } from './useRulesMetadata';

const fields = 'id,displayName,condition,description,program[id],programStage[id],priority,programRuleActions[id,content,location,data,priority,programRuleActionType,programStageSection[id],dataElement[id],trackedEntityAttribute[id],option[id],optionGroup[id],programIndicator[id],programStage[id]]';

export function useGetProgramRules(programs: string[]) {
    const { loading, error, refetch } = useRulesMetadata(programs, 'programRules', fields, ProgramRulesConfigState);
    return { loadingPRules: loading, errorPRules: error, refetch };
}
