import { CustomAttributeProps, ProgramConfig, VariablesTypes } from "dhis2-semis-types";
import { Attribute } from "../../../types/generated/models";

interface FormatVariablesProps {
    variables: ProgramConfig["programTrackedEntityAttributes"][] | string[]
    type: VariablesTypes
    selectedDate?: any
}
export function formatVariables({ variables, type }: FormatVariablesProps) {
    if (variables?.length) {
        switch (type) {
            case VariablesTypes.Attribute:
                return formatAttributeVariables(variables);

            case VariablesTypes.DataElement:
                return formatDataElementVariables(variables, VariablesTypes.DataElement);

            case VariablesTypes.Default:
                return formatDefaultColumns(variables as string[]);

            default:
                return [];
        }
    }
}

export const formatAttributeVariables = (programTrackedEntityAttributes: any[]) => {
    const formattedAttributes = programTrackedEntityAttributes?.map((item) => {
        return {
            id: item.trackedEntityAttribute.id,
            displayName: item.trackedEntityAttribute.displayName,
            header: item.trackedEntityAttribute.displayName,
            required: item.mandatory,
            name: item.trackedEntityAttribute.displayName,
            labelName: item.trackedEntityAttribute.displayName,
            valueType: item.trackedEntityAttribute.optionSet?.options?.length > 0 ? Attribute.valueType.LIST as unknown as CustomAttributeProps["valueType"] : item.trackedEntityAttribute.valueType as unknown as CustomAttributeProps["valueType"],
            initialOptions: { optionSet: item.trackedEntityAttribute.optionSet },
            options: { optionSet: item.trackedEntityAttribute.optionSet },
            visible: item.displayInList,
            disabled: false,
            pattern: '',
            searchable: item.searchable,
            error: false,
            content: '',
            key: item.trackedEntityAttribute.id,
            unique: item.trackedEntityAttribute.unique,
            type: VariablesTypes.Attribute
        }
    })
    return formattedAttributes;
}

export const formatDataElementVariables = (programStageDataElements: any[], type: VariablesTypes) => {
    const formattedDataElements = programStageDataElements?.map((programStageDataElement) => {
        return {
            id: programStageDataElement.dataElement.id,
            displayName: programStageDataElement.dataElement.displayName,
            header: programStageDataElement.dataElement.displayName,
            required: programStageDataElement.compulsory,
            name: programStageDataElement.dataElement.displayName,
            labelName: programStageDataElement.dataElement.displayName,
            valueType: programStageDataElement.dataElement.optionSet?.options?.length > 0 ? Attribute.valueType.LIST as unknown as CustomAttributeProps["valueType"] : programStageDataElement.dataElement.valueType as unknown as CustomAttributeProps["valueType"],
            options: { optionSet: programStageDataElement.dataElement.optionSet },
            initialOptions: { optionSet: programStageDataElement.dataElement.optionSet },
            visible: programStageDataElement.displayInReports,
            disabled: false,
            pattern: '',
            searchable: false,
            error: false,
            content: '',
            key: programStageDataElement.dataElement.id,
            type
        }
    }) as []
    return formattedDataElements;
}

export const formatDefaultColumns = (defaultColumns: string[]) => {
    const formattedDefaultColumns = defaultColumns?.map((column) => {
        return {
            id: column,
            displayName: column,
            header: column,
            required: false,
            name: column,
            labelName: column,
            valueType: Attribute.valueType.TEXT as unknown as CustomAttributeProps["valueType"],
            options: undefined,
            initialOptions: undefined,
            visible: true,
            disabled: false,
            pattern: '',
            searchable: false,
            error: false,
            content: '',
            key: '',
            type: VariablesTypes.Custom
        }
    }) as []
    return formattedDefaultColumns;
}


