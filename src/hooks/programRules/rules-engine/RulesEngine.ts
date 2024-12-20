import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { CustomAttributeProps, GroupFormProps } from "dhis2-semis-components";
import { existValue, executeFunctionName } from "../../../utils/programRules/functions";
import { RulesEngineProps, RulesType } from "../../../types/programRules/RulesEngineProps";
import { OptionGroupsConfigState, OrgUnitsGroupsConfigState, ProgramRulesFormatedState } from "../../../schema";
import { compareStringByLabel, formatKeyValueType as formatValuesToKeyValue } from "../../../utils/programRules/formaters";


/**
 * The function that implements the program rules.
 * @returns {{ runRulesEngine: (data?: {}) => void; updatedVariables: any; }} The fields modified based on their values and program rule.
 * 
 *  @example
 * Example usage:
 export const RulesEngineForm = (props: any) => {
    
    const onError = (message: string) => {
        console.error(message)
    }

    const { runRulesEngine, updatedVariables } = RulesEngine({
        variables: [] // an array of valid variables,
          values: { "id": "value", ...},
        type: RulesType.ProgramStageSection,
        onError: onError
    })

    useEffect(() => {
        runRulesEngine(fields)
    }, [values])

    return (
        <Form>
            updatedVariables?.map((field: any, index: number) => {
                return (
                    <GroupForm
                        key={index}
                        name={field.section}
                        fields={field.fields}
                        description={field.description}
                    />
                )
            })
        </Form>
    )
}
*/
export const RulesEngine = (props: RulesEngineProps): { runRulesEngine: (data?: GroupFormProps[] | CustomAttributeProps[]) => void; updatedVariables: any; } => {
    const { variables = [], values, type, programStage, onError } = props
    const formatKeyValueType = formatValuesToKeyValue(variables)
    const getOptionGroups = useRecoilValue(OptionGroupsConfigState)
    const orgUnitsGroups = useRecoilValue(OrgUnitsGroupsConfigState)
    const newProgramRules = useRecoilValue(ProgramRulesFormatedState)
    const [updatedVariables, setUpdatedVariables] = useState<typeof variables>([])

    useEffect(() => {
        if (updatedVariables.length === 0)
            setUpdatedVariables([...variables] as typeof variables)
    }, [variables])

    function runRulesEngine(data?: typeof variables) {
        if (type === RulesType.ProgramStage) runRulesEngineDataElements(data)
        else if(type === RulesType.ProgramStageSection) runRulesEngineSections(data, "fields")
        else if (type === RulesType.AttributesSection) runRulesEngineSections(data, "variable")
    }

/** Rules engine function for attributes/programSections and programStageSections. */
function runRulesEngineSections(data: any[] = [], sectionVariableKey: string) {
    const localVariablesSections = data?.length > 0 ? data : [...updatedVariables];
    const updatedVariablesCopy = localVariablesSections.map(section => {
       
        const updatedSection = { ...section };
        updatedSection[sectionVariableKey] = section[sectionVariableKey]?.map((variable: any) => {
            return applyRulesToVariable(variable);
        });
        return updatedSection
    });

    setUpdatedVariables(updatedVariablesCopy);
}

/** Rules engine function for simple variables without sections. */
function runRulesEngineDataElements(data: any[] = []) {
    const localVariables = data?.length > 0 ? data : [...updatedVariables]
    const updatedVariablesCopy = localVariables?.map(variable => {
        return applyRulesToVariable(variable);
    });

    setUpdatedVariables(updatedVariablesCopy);
}

/** Applies rules to variables. */
function applyRulesToVariable(variable: any) {
    const newProgramRulesFiltered = newProgramRules.filter(x => x.variable === variable.name)
    // const newProgramRulesFiltered = !programStage ? newProgramRules.filter(x => x.programStage === programStage) : newProgramRules.filter(x => x.variable === variable.name)

    for (const programRule of newProgramRulesFiltered || []) {
        try {
            switch (programRule.type) {
                case "attribute":
                case "dataElement":
                    switch (programRule.programRuleActionType) {
                        case "ASSIGN":
                            if (variable.name === programRule.variable) {
                                // Get the first condition and associated value
                                const firstCondition = existValue(programRule.condition, values, formatKeyValueType);
                                const value = executeFunctionName(programRule.functionName, existValue(programRule.data, values, formatKeyValueType));

                                try {
                                    //Evaluate the condition once
                                    const evaluatedCondition = eval(firstCondition ?? "");

                                    // Check if the condition is a string and the variable type
                                    const isStringCondition = typeof evaluatedCondition === "string" || typeof evaluatedCondition === "boolean";
                                    const isValidType = formatKeyValueType![variable.name] !== "INTEGER_ZERO_OR_POSITIVE" && formatKeyValueType![variable.name] !== "NUMBER";

                                    if (isStringCondition && isValidType) {
                                        if (evaluatedCondition) {
                                            // Assigning values ​​if the condition is true
                                            values[variable.name] = value !== undefined ? value : "";
                                            variable.value = value !== undefined ? value : "";
                                        }
                                    }
                                    // Check if the condition is a number
                                    else if (typeof evaluatedCondition === "number") {
                                        values[variable.name] = value !== undefined ? value : "";
                                        variable.value = value !== undefined ? value : "";
                                    }

                                    // Disable the variable after processing
                                    variable.disabled = true;

                                } catch (error) {
                                    // In case of error, disable the variable
                                    onError(error)
                                    variable.disabled = true;
                                }
                            }
                            break;

                        case "SHOWOPTIONGROUP":
                            if (variable.name === programRule.variable) {
                                if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                    const options = getOptionGroups?.filter((op) => op.id === programRule.optionGroup)?.[0]?.options || []
                                    variable.options = { optionSet: { options: options } }
                                }
                            }
                            break;

                        case "SHOWWARNING":
                            if (variable.name === programRule.variable) {
                                if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                    variable.content = programRule.content
                                    variable.warning = true
                                } else {
                                    variable.content = ""
                                    variable.warning = false
                                }
                            }
                            break;

                        case "SHOWERROR":
                            if (variable.name === programRule.variable) {
                                if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                    variable.error = true;
                                    variable.content = programRule.content
                                    variable.required = true;
                                } else {
                                    variable.error = false;
                                    variable.content = ""
                                    variable.required = false;
                                }
                            }
                            break;

                        case "HIDEFIELD":
                            if (variable.name === programRule.variable) {
                                if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                    variable.visible = false;
                                } else {
                                    variable.visible = true;
                                }
                            }
                            break;
                            
                        case "HIDESECTION":
                            break;

                        case "HIDEOPTIONGROUP":
                            if (variable.name === programRule.variable) {
                                const orgUnitGroup = programRule?.condition?.replace(/[^a-zA-Z]/g, '')
                                const foundOrgUnitGroup = orgUnitsGroups?.filter(x => x.value === orgUnitGroup)

                                if (foundOrgUnitGroup.length > 0) {

                                    if (foundOrgUnitGroup[0]?.organisationUnits.findIndex(x => x.value === values["orgUnit"]) > -1) {
                                        const options = getOptionGroups?.filter((op) => op.id === programRule.optionGroup)?.[0]?.options?.slice()?.sort(compareStringByLabel) || []

                                        variable.options = { optionSet: { options: variable?.initialOptions?.optionSet?.options?.filter((obj1: { value: string }) => !options.some(obj2 => obj2.value === obj1.value)) } }
                                    }
                                }
                            }
                            break;

                        default:
                            break;
                    }
                    break;
            }
        }

        catch (error) {
            onError(error)
        }
    }

    return variable;
}

return { runRulesEngine, updatedVariables }
}