export interface OrgUnitsGroupsConfig {
    value: string;
    label: string;
    organisationUnits: Array<{
        value: string;
        label: string;
    }>;
}
export declare const OrgUnitsGroupsConfigState: import("recoil").RecoilState<OrgUnitsGroupsConfig[]>;
