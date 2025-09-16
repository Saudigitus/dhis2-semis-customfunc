import { Attribute } from "../../types/generated/models";
import { returnOptionsByDataElement } from "./getDataElementOptions";
import { CustomAttributeProps, VariablesTypes } from "dhis2-semis-types";
import { ProgramStageConfig } from "../../types/programStageConfig/ProgramStageConfig";

export function formatResponseDataElements(programStageObject: ProgramStageConfig, schoolCalendar?: any): CustomAttributeProps[] {
    if (!programStageObject) return [];

    return programStageObject.programStageDataElements.map(programStageDataElement => (
        {
            required: programStageDataElement.compulsory,
            name: programStageDataElement.dataElement.id,
            labelName: programStageDataElement.dataElement.formName ?? programStageDataElement.dataElement.displayName,
            valueType: programStageDataElement.dataElement?.optionSet
                ? Attribute.valueType.LIST as unknown as CustomAttributeProps["valueType"]
                : programStageDataElement.dataElement?.valueType as unknown as CustomAttributeProps["valueType"],
            options: {
                optionSet: {
                    id: programStageDataElement?.dataElement?.optionSet?.id,
                    options: returnOptionsByDataElement({ programStageDataElement, schoolCalendar })
                }
            },
            initialOptions: {
                optionSet: {
                    id: programStageDataElement?.dataElement?.optionSet?.id,
                    options: returnOptionsByDataElement({ programStageDataElement, schoolCalendar })
                }
            },
            disabled: false,
            pattern: "",
            visible: true,
            description: programStageDataElement.dataElement.formName ?? programStageDataElement.dataElement.displayName,
            searchable: programStageDataElement.dataElement.displayInReports as unknown as boolean,
            error: false,
            programStage: programStageObject.id,
            content: "",
            id: programStageDataElement.dataElement?.id,
            displayName: programStageDataElement.dataElement.formName ?? programStageDataElement.dataElement?.displayName,
            header: programStageDataElement.dataElement.formName ?? programStageDataElement.dataElement?.displayName,
            type: VariablesTypes.DataElement,
            assignedValue: undefined
        }
    ));
}
