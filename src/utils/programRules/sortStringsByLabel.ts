import { OptionsProps } from "dhis2-semis-components";

export function compareStringByLabel(a: OptionsProps, b: OptionsProps) {
    try {
        return Number(a.label.split(" ")[1]) - Number(b.label.split(" ")[1]);

    } catch (error) {
        if (a.label < b.label) {
            return -1;
        }
        if (a.label > b.label) {
            return 1;
        }
        return 0;
    }
}