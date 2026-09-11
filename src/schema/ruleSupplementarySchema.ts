import { atom } from 'recoil';

export const RuleSupplementaryState = atom<{
    constants: Record<string, string>;
    userGroups: string[];
    userRoles: string[];
}>({ key: 'semis-rule-engine-supplementary', default: { constants: {}, userGroups: [], userRoles: [] } });
