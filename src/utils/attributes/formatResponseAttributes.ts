import { Attribute } from "../../types/generated/models";
import { CustomAttributeProps, ProgramConfig, VariablesTypes } from "dhis2-semis-components";

export function formatResponseAttributes(attributes: ProgramConfig): CustomAttributeProps[]{
    if (!attributes) return [];

    return attributes?.programTrackedEntityAttributes?.map((trackedEntityAttribute: any) => (
        {
            required: trackedEntityAttribute?.mandatory,
            name: trackedEntityAttribute?.trackedEntityAttribute?.id,
            labelName: trackedEntityAttribute?.trackedEntityAttribute?.displayName,
            valueType: trackedEntityAttribute?.trackedEntityAttribute?.optionSet
                ? Attribute.valueType.LIST as unknown as CustomAttributeProps["valueType"]
                : trackedEntityAttribute?.trackedEntityAttribute?.valueType as unknown as CustomAttributeProps["valueType"],
            options: { optionSet: trackedEntityAttribute?.trackedEntityAttribute?.optionSet },
            initialOptions: { optionSet: trackedEntityAttribute?.trackedEntityAttribute?.optionSet },
            visible: true,
            disabled: trackedEntityAttribute?.trackedEntityAttribute?.generated,
            pattern: trackedEntityAttribute?.trackedEntityAttribute?.pattern,
            searchable: trackedEntityAttribute?.searchable,
            error: false,
            warning: false,
            content: "",
            id: trackedEntityAttribute?.trackedEntityAttribute?.id,
            displayName: trackedEntityAttribute?.trackedEntityAttribute?.displayName,
            header: trackedEntityAttribute?.trackedEntityAttribute?.displayName,
            type: VariablesTypes.Attribute,
            programStage: "",
            unique: trackedEntityAttribute?.trackedEntityAttribute?.unique,
            assignedValue: undefined
        }
    )) as CustomAttributeProps[];
}
