export interface OptionGroupsConfig {
    id: string;
    options: Array<{
        value: string;
        label: string;
    }>;
}
export declare const OptionGroupsConfigState: import("recoil").RecoilState<OptionGroupsConfig[]>;
