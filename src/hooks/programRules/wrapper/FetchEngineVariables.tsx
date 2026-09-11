import { useDataQuery } from '@dhis2/app-runtime';
import { useSetRecoilState } from 'recoil';
import { useGetProgramRules } from '../hooks/useGetProgramRules';
import { useGetProgramRulesVariables } from '../hooks/useGetProgramRulesVariables';
import { OptionGroupsConfigState } from '../../../schema/optionGroupsSchema';
import { OrgUnitsGroupsConfigState } from '../../../schema/orgUnitsGroupSchema';
import { RuleSupplementaryState } from '../../../schema/ruleSupplementarySchema';

const query = {
    options: { resource: 'optionGroups', params: { paging: false, fields: 'id,options[id,code~rename(value),displayName~rename(label)]' } },
    orgUnits: { resource: 'organisationUnitGroups', params: { paging: false, fields: 'id,code~rename(value),displayName~rename(label),organisationUnits[id~rename(value)]' } },
    constants: { resource: 'constants', params: { paging: false, fields: 'id,displayName,value' } },
    user: { resource: 'me', params: { fields: 'userGroups[id],userCredentials[userRoles[id]]' } },
};

/** Load a coherent metadata set before mounting forms; never reuse the old cache. */
export default function FetchEngineVariables(programs: string[]) {
    const rules = useGetProgramRules(programs);
    const variables = useGetProgramRulesVariables(programs);
    const setOptions = useSetRecoilState(OptionGroupsConfigState);
    const setOrgUnits = useSetRecoilState(OrgUnitsGroupsConfigState);
    const setSupplementary = useSetRecoilState(RuleSupplementaryState);
    const supplementary = useDataQuery(query, {
        onComplete: (data: any) => {
            setOptions(data.options.optionGroups ?? []);
            setOrgUnits(data.orgUnits.organisationUnitGroups ?? []);
            setSupplementary({
                constants: Object.fromEntries((data.constants.constants ?? []).flatMap((c: any) => [[c.id, String(c.value)], [c.displayName, String(c.value)]])),
                userGroups: (data.user.userGroups ?? []).map((g: any) => g.id),
                userRoles: (data.user.userCredentials?.userRoles ?? []).map((r: any) => r.id),
            });
        },
    });
    return {
        loading: rules.loadingPRules || variables.loadingPRulesVariables || supplementary.loading,
        error: rules.errorPRules || variables.errorPRulesVariables || !!supplementary.error,
    };
}
