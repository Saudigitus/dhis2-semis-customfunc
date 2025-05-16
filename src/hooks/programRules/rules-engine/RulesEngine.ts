import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { OptionGroupsConfigState } from "../../../schema/optionGroupsSchema";
import { OrgUnitsGroupsConfigState } from "../../../schema/orgUnitsGroupSchema";
import { compareStringByLabel } from "../../../utils/programRules/sortStringsByLabel";
import { useFormatProgramRulesVariables } from "../hooks/useFormatProgramRulesVariables";
import { useFormatProgramRules } from "../hooks/useFormatProgramRules";

interface RulesEngineProps {
    variables: any[]
    values: Record<string, any>
    type: "programStage" | "programStageSection" | "attributesSection"
    program: string
}

export const CustomDhis2RulesEngine = (props: RulesEngineProps) => {
    const { variables, values, type, program } = props
    const getOptionGroups = useRecoilValue(OptionGroupsConfigState)
    const [updatedVariables, setUpdatedVariables] = useState([...variables])
    const orgUnitsGroups = useRecoilValue(OrgUnitsGroupsConfigState)
    const { programRulesVariables } = useFormatProgramRulesVariables(program)
    const { newProgramRules } = useFormatProgramRules(program)

    useEffect(() => {
        if (updatedVariables.length === 0) {
            setUpdatedVariables([...variables])
        }
    }, [variables])

    function runRulesEngine() {
        if (type === "programStageSection") rulesEngineSections()
        else if (type === "programStage") rulesEngineDataElements()
        else if (type === "attributesSection") rulesEngineAttributesSections()
    }

    // rules engine function for attributes/programSections
    function rulesEngineAttributesSections() {
        const localVariablesSections = [...updatedVariables]
        const updatedVariablesCopy = localVariablesSections?.map(section => {
            const updatedSection = { ...section };
            updatedSection.variable = section?.variable?.map((variable: any) => {
                return applyRulesToVariable(variable);
            });
            return updatedSection;
        });
        setUpdatedVariables(updatedVariablesCopy)
    }

    // rules engine function for programStageSections
    function rulesEngineSections() {
        const localVariablesSections = [...updatedVariables]
        const updatedVariablesCopy = localVariablesSections?.map(section => {
            const updatedSection = { ...section };
            updatedSection.fields = section?.fields?.map((variable: any) => {
                return applyRulesToVariable(variable);
            });
            return updatedSection;
        });
        setUpdatedVariables(updatedVariablesCopy)
    }

    // rules engine function for simple variables without sections
    function rulesEngineDataElements() {
        const localVariables = [...updatedVariables]
        const updatedVariablesCopy = localVariables?.map(variable => {
            return applyRulesToVariable(variable);
        });

        setUpdatedVariables(updatedVariablesCopy);
    }

    function evaluateExpression(expression: any, context: any, values: any, programRulesVariables: any) {
        const d2 = createD2(context);

        console.log(expression, "starting expression")

        expression = expression.replace(/today\(\)/g, `d2.today()`);
        expression = expression.replace(/d2:(\w+)/g, "d2.$1");
        expression = expression.replace(/V\{event_date\}/g, "V{enrollment_date}");

        // Replace #{variable} with values['variable']
        expression = expression.replace(/#\{([^}]+)\}/g, (match: any, key: any) => {
            console.log(key, "# key")
            console.log(programRulesVariables, "programRulesVariables", programRulesVariables[key])
            console.log(values, "values")
            const value = values[programRulesVariables[key]];
            return typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value;
        });

        // Replace A{attribute} with values['attribute']
        expression = expression.replace(/A\{([^}]+)\}/g, (match: any, key: any) => {
            const value = values[programRulesVariables[key]];
            return typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value;
        });

        // Replace V{variable} with values['variable'] (consider revising for DHIS2 program variables)
        expression = expression.replace(/V\{([^}]+)\}/g, (match: any, key: any) => {
            const value = values[key];
            return typeof value === 'string' ? `'${value}'` : value === undefined ? 'undefined' : value;
        });

        console.log(expression, "expression")

        try {
            const func = new Function('d2', 'context', `return ${expression};`);
            return func(d2, context);
        } catch (error) {
            console.error('Error evaluating expression:', expression, error);
            return null;
        }
    }

    function createD2(context: any) {
        const today = new Date().toISOString().split('T')[0]; // Current date in 'YYYY-MM-DD'

        return {
            hasValue: function (value: any) {
                return value !== null && value !== undefined && value !== '';
            },
            yearsBetween: function (date1: any, date2: any) {
                const d1 = new Date(date1);
                const d2 = new Date(date2);
                let years = d2.getFullYear() - d1.getFullYear();
                // Adjust if the full year hasn't been completed
                if (d2.getMonth() < d1.getMonth() ||
                    (d2.getMonth() === d1.getMonth() && d2.getDate() < d1.getDate())) {
                    years--;
                }
                return years;
            },
            daysBetween: function (date1: any, date2: any) {
                const d1 = new Date(date1) as unknown as number;
                const d2 = new Date(date2) as unknown as number;
                const diffTime = Math.abs(d2 - d1);
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            },
            addDays: function (date: any, days: any) {
                const d = new Date(date);
                d.setDate(d.getDate() + parseInt(days));
                return d.toISOString().split('T')[0];
            },
            substring: function (text: any, start: any, end: any) {
                if (typeof text !== 'string') return '';
                return text.substring(parseInt(start), parseInt(end));
            },
            today: function () {
                return today;
            },
            length: function (value: any) {
                return typeof value === 'string' ? value.length : 0;
            },
            inOrgUnitGroup: function (orgUnitGroup: any) {
                return orgUnitsGroups?.filter(x => x.value === orgUnitGroup);
            },
            validatePattern: function (value: any, pattern: any) {
                try {
                    const regex = new RegExp(pattern);
                    return regex.test(value);
                } catch (error) {
                    console.error('Invalid pattern:', pattern, error);
                    return false;
                }
            },
            concatenate: function (...args: any) {
                return args.join("");
            },
            left: function (text: any, num: number) {
                if (typeof text !== "string") return "";
                return text.substring(0, num);
            },
            right: function (text: any, num: number) {
                if (typeof text !== "string") return "";
                return text.substring(text.length - num);
            },
            floor: function (value: number) {
                console.log("something for test:", value);
                return Math.floor(value);
            },
        };
    }

    // apply rules to variables
    function applyRulesToVariable(variable: any) {
        console.log(variable, "variable")
        console.log(programRulesVariables, "programRulesVariables")
        console.log(newProgramRules, "newProgramRules")


        for (const programRule of newProgramRules.filter(x => x.variable === variable.id) || []) {
            const firstCondition = evaluateExpression(programRule.condition, variable, values, programRulesVariables);
            switch (programRule.programRuleActionType) {
                case "ASSIGN":
                    if (variable.id === programRule.variable) {
                        const value = evaluateExpression(programRule.data, variable, values, programRulesVariables);
                        console.log(firstCondition)
                        if (firstCondition) {
                            if (value !== undefined) {
                                console.log(value, "valueTo Assign")
                                values[variable.id] = value
                            } else {
                                console.log(value, "valueTo Assign, else")

                                values[variable.id] = ""
                            }
                            variable.disabled = true
                        }
                    }
                    break;
                case "SHOWOPTIONGROUP":
                    if (variable.id === programRule.variable) {
                        if (firstCondition) {
                            const options = getOptionGroups?.filter((op) => op.id === programRule.optionGroup)?.[0]?.options || []
                            variable.options = { optionSet: { options: options } }
                        }
                    }
                    break;
                case "SHOWWARNING":
                    if (variable.id === programRule.variable) {
                        if (firstCondition) {
                            variable.content = programRule.content
                            variable.warning = true
                        } else {
                            variable.content = ""
                            variable.warning = false
                        }
                    }
                    break;
                case "SHOWERROR":
                    if (variable.id === programRule.variable) {
                        if (firstCondition) {
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
                    if (variable.id === programRule.variable) {
                        if (firstCondition) {
                            variable.visible = false;
                        } else {
                            variable.visible = true;
                        }
                    }
                    break;
                case "HIDESECTION":
                    break;

                case "HIDEOPTIONGROUP":
                    if (variable.id === programRule.variable) {
                        // const orgUnitGroup = programRule?.condition?.replace(/[^a-zA-Z]/g, '')
                        if (firstCondition) {
                            console.log(variable)
                            if (firstCondition[0]?.organisationUnits.findIndex((x: any) => x.value === values["orgUnit"]) > -1) {
                                const options = getOptionGroups?.filter((op) => op.id === programRule.optionGroup)?.[0]?.options?.slice()?.sort(compareStringByLabel) || []

                                variable.options = { optionSet: { options: variable?.optionSet?.options?.filter((obj1: any) => !options.some(obj2 => obj2.value === obj1.value)) || variable?.initialOptions?.optionSet?.options?.filter((obj1: any) => !options.some(obj2 => obj2.value === obj1.value)) } }
                            }
                        }
                    }
                    break;
            }
        }
        return variable;
    }

    return {
        runRulesEngine,
        updatedVariables
    }
}


// export function getValueTypeVariable(variables: any, variable: any, type: string) {
//     if (type === "programStageSection") {
//         let variableType = ""
//         variables?.map((section: any) => {
//             section?.fields?.map((sectionVar: any) => {
//                 if (sectionVar.name === variable.variable) {
//                     variableType = sectionVar.valueType
//                 }
//             });
//         });
//         return variableType
//     }
// }