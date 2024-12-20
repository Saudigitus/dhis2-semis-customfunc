import { format } from "date-fns";
import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { OptionGroupsConfigState } from "../../../schema/optionGroupsSchema";
import { OrgUnitsGroupsConfigState } from "../../../schema/orgUnitsGroupSchema";
import { ProgramRulesFormatedState } from "../../../schema/programRulesFormated";
import { compareStringByLabel } from "../../../utils/programRules/sortStringsByLabel";
import { RulesType } from "../../../types/programRules/RulesEngineProps";
import { formatKeyValueType as formatValuesToKeyValue } from "../../../utils/programRules/formatKeyValueType";
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
export const RulesEngine = (props) => {
    const { variables = [], values, type, programStage, onError } = props;
    const formatKeyValueType = formatValuesToKeyValue(variables);
    const getOptionGroups = useRecoilValue(OptionGroupsConfigState);
    const orgUnitsGroups = useRecoilValue(OrgUnitsGroupsConfigState);
    const newProgramRules = useRecoilValue(ProgramRulesFormatedState);
    const [updatedVariables, setUpdatedVariables] = useState([]);
    useEffect(() => {
        if (updatedVariables.length === 0) {
            setUpdatedVariables([...variables]);
        }
    }, [variables]);
    function runRulesEngine(data) {
        if (type === RulesType.ProgramStageSection)
            rulesEngineSections(data);
        else if (type === RulesType.ProgramStage)
            rulesEngineDataElements(data);
        else if (type === RulesType.AttributesSection)
            rulesEngineAttributesSections(data);
    }
    /** Rules engine function for attributes/programSections. */
    function rulesEngineAttributesSections(data = []) {
        const localVariablesSections = (data === null || data === void 0 ? void 0 : data.length) > 0 ? data : [...updatedVariables];
        const updatedVariablesCopy = localVariablesSections === null || localVariablesSections === void 0 ? void 0 : localVariablesSections.map(section => {
            var _a;
            const updatedSection = Object.assign({}, section);
            updatedSection.variable = (_a = section === null || section === void 0 ? void 0 : section.variable) === null || _a === void 0 ? void 0 : _a.map((variable) => {
                return applyRulesToVariable(variable);
            });
            return updatedSection;
        });
        setUpdatedVariables(updatedVariablesCopy);
    }
    /** Rules engine function for programStageSections. */
    function rulesEngineSections(data = []) {
        const localVariablesSections = (data === null || data === void 0 ? void 0 : data.length) > 0 ? data : [...updatedVariables];
        const updatedVariablesCopy = localVariablesSections === null || localVariablesSections === void 0 ? void 0 : localVariablesSections.map(section => {
            var _a;
            const updatedSection = Object.assign({}, section);
            updatedSection.fields = (_a = section === null || section === void 0 ? void 0 : section.fields) === null || _a === void 0 ? void 0 : _a.map((variable) => {
                return applyRulesToVariable(variable);
            });
            return updatedSection;
        });
        setUpdatedVariables(updatedVariablesCopy);
    }
    /** Rules engine function for simple variables without sections. */
    function rulesEngineDataElements(data = []) {
        const localVariables = (data === null || data === void 0 ? void 0 : data.length) > 0 ? data : [...updatedVariables];
        const updatedVariablesCopy = localVariables === null || localVariables === void 0 ? void 0 : localVariables.map(variable => {
            return applyRulesToVariable(variable);
        });
        setUpdatedVariables(updatedVariablesCopy);
    }
    /** Applies rules to variables. */
    function applyRulesToVariable(variable) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        const newProgramRulesFiltered = newProgramRules.filter(x => x.variable === variable.name);
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
                                        const evaluatedCondition = eval(firstCondition !== null && firstCondition !== void 0 ? firstCondition : "");
                                        // Check if the condition is a string and the variable type
                                        const isStringCondition = typeof evaluatedCondition === "string" || typeof evaluatedCondition === "boolean";
                                        const isValidType = formatKeyValueType[variable.name] !== "INTEGER_ZERO_OR_POSITIVE" && formatKeyValueType[variable.name] !== "NUMBER";
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
                                    }
                                    catch (error) {
                                        // In case of error, disable the variable
                                        onError(error);
                                        variable.disabled = true;
                                    }
                                }
                                break;
                            case "SHOWOPTIONGROUP":
                                if (variable.name === programRule.variable) {
                                    if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                        const options = ((_b = (_a = getOptionGroups === null || getOptionGroups === void 0 ? void 0 : getOptionGroups.filter((op) => op.id === programRule.optionGroup)) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.options) || [];
                                        variable.options = { optionSet: { options: options } };
                                    }
                                }
                                break;
                            case "SHOWWARNING":
                                if (variable.name === programRule.variable) {
                                    if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                        variable.content = programRule.content;
                                        variable.warning = true;
                                    }
                                    else {
                                        variable.content = "";
                                        variable.warning = false;
                                    }
                                }
                                break;
                            case "SHOWERROR":
                                if (variable.name === programRule.variable) {
                                    if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                        variable.error = true;
                                        variable.content = programRule.content;
                                        variable.required = true;
                                    }
                                    else {
                                        variable.error = false;
                                        variable.content = "";
                                        variable.required = false;
                                    }
                                }
                                break;
                            case "HIDEFIELD":
                                if (variable.name === programRule.variable) {
                                    if (executeFunctionName(programRule.functionName, existValue(programRule.condition, values, formatKeyValueType))) {
                                        variable.visible = false;
                                    }
                                    else {
                                        variable.visible = true;
                                    }
                                }
                                break;
                            case "HIDESECTION":
                                break;
                            case "HIDEOPTIONGROUP":
                                if (variable.name === programRule.variable) {
                                    const orgUnitGroup = (_c = programRule === null || programRule === void 0 ? void 0 : programRule.condition) === null || _c === void 0 ? void 0 : _c.replace(/[^a-zA-Z]/g, '');
                                    const foundOrgUnitGroup = orgUnitsGroups === null || orgUnitsGroups === void 0 ? void 0 : orgUnitsGroups.filter(x => x.value === orgUnitGroup);
                                    if (foundOrgUnitGroup.length > 0) {
                                        if (((_d = foundOrgUnitGroup[0]) === null || _d === void 0 ? void 0 : _d.organisationUnits.findIndex(x => x.value === values["orgUnit"])) > -1) {
                                            const options = ((_h = (_g = (_f = (_e = getOptionGroups === null || getOptionGroups === void 0 ? void 0 : getOptionGroups.filter((op) => op.id === programRule.optionGroup)) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.options) === null || _g === void 0 ? void 0 : _g.slice()) === null || _h === void 0 ? void 0 : _h.sort(compareStringByLabel)) || [];
                                            variable.options = { optionSet: { options: (_l = (_k = (_j = variable === null || variable === void 0 ? void 0 : variable.initialOptions) === null || _j === void 0 ? void 0 : _j.optionSet) === null || _k === void 0 ? void 0 : _k.options) === null || _l === void 0 ? void 0 : _l.filter((obj1) => !options.some(obj2 => obj2.value === obj1.value)) } };
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
                onError(error);
            }
        }
        return variable;
    }
    return {
        runRulesEngine,
        updatedVariables
    };
};
/** A function to remove characters that are not reconized on Js to make possible to run eval() function. */
export function removeSpecialCharacters(text) {
    if (typeof text === "string") {
        return text
            .replaceAll("d2:hasValue", "")
            .replaceAll("d2:yearsBetween", "")
            .replaceAll("d2:concatenate", "")
            .replaceAll("d2:inOrgUnitGroup", "")
            .replaceAll("#{", "")
            .replaceAll("A{", "")
            .replaceAll("V{", "")
            .replaceAll("}", "")
            .replaceAll("current_date", `'${format(new Date(), "yyyy-MM-dd")}'`);
    }
}
/** Replaces condition with specific variable. */
export function replaceConditionVariables(condition, variables) {
    if (!condition) {
        return condition;
    }
    // Regex to capture full words outside of single quotes
    const regex = /(\b\w+\b)(?=(?:[^']*'[^']*')*[^']*$)/g;
    // Replacement
    const newcondition = condition.replace(regex, (match) => {
        return variables[match] !== undefined ? `'${variables[match]}'` : match;
    });
    return newcondition;
}
/** Gets function name of the program rule. */
export function getFunctionExpression(condition) {
    var _a, _b;
    return (_b = (_a = condition === null || condition === void 0 ? void 0 : condition.split("d2:")) === null || _a === void 0 ? void 0 : _a[1]) === null || _b === void 0 ? void 0 : _b.split("(")[0];
}
/** Replaces variables ids with specific value sent from the component which implements the rule. */
export function replaceEspecifValue(values, variables, variable) {
    // eslint-disable-next-line no-prototype-builtins
    if (values.hasOwnProperty(variables[variable])) {
        if (values[variables[variable]] != false) {
            return `'${values[variables[variable]]}'`;
        }
    }
    return false;
}
/** Verifies if a given string is a valid date. */
function isDate(str) {
    // Remove parentheses if they exist
    if (typeof str === 'string') {
        const cleanedStr = str === null || str === void 0 ? void 0 : str.replace(/[()]/g, '');
        // Try to create a Date object
        const date = new Date(cleanedStr);
        // Checks if the created date is valid
        return !isNaN(date.getTime());
    }
    return str;
}
/** Executes program rule condition or action function. */
function executeFunctionName(functionName, condition) {
    var _a, _b;
    switch (functionName) {
        case "hasValue":
            return isDate(condition) ? condition : eval(condition !== null && condition !== void 0 ? condition : "");
        case "yearsBetween":
            return eval((_a = d2YearsBetween(condition, condition === null || condition === void 0 ? void 0 : condition.split(")"))) !== null && _a !== void 0 ? _a : "");
        case "inOrgUnitGroup":
            return true;
        case "length":
            return eval(compareLength(condition !== null && condition !== void 0 ? condition : ""));
        case "substring":
            let function_paramter = returnSubstring((_b = condition === null || condition === void 0 ? void 0 : condition.split("d2:substring(").pop()) !== null && _b !== void 0 ? _b : "");
            const formated_function = condition === null || condition === void 0 ? void 0 : condition.replaceAll(condition === null || condition === void 0 ? void 0 : condition.split("d2:substring(").pop(), function_paramter).replaceAll("d2:substring", '').replaceAll("(", '');
            return eval(formated_function);
        default:
            return eval(condition !== null && condition !== void 0 ? condition : "");
    }
}
/** Returns a sustring given the string and indexs. */
function returnSubstring(value) {
    const [stringToRepair, startStr, endStr] = value.replaceAll(")", "").split(",");
    const start = Number(startStr);
    const end = Number(endStr);
    const repairedString = stringToRepair.substring(start, end);
    if (!isNaN(Number.parseInt(repairedString)))
        return Number.parseInt(repairedString);
    else
        return `'${repairedString}'`;
}
/** Compares values in string. */
function compareLength(condition) {
    const results = [];
    let newcondition = 'false';
    if (condition) {
        for (const match of condition === null || condition === void 0 ? void 0 : condition.matchAll(/d2:length\('(.*?)'\)/g)) {
            results.push(match[1]);
        }
        for (const result of results) {
            newcondition = condition === null || condition === void 0 ? void 0 : condition.replace(`d2:length('${result}')`, `${result.length}`);
        }
    }
    return newcondition;
}
/** Returns years between dates. */
function d2YearsBetween(origin, condition) {
    if (!origin || !condition || condition.length !== 1) {
        return undefined;
    }
    const [date1Str, date2Str] = condition[0].split(",").map(date => date.trim());
    const date1 = new Date(date1Str.replaceAll("(", ""));
    const date2 = new Date(date2Str);
    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
        return undefined;
    }
    const diffYears = Math.abs(date2.getFullYear() - date1.getFullYear());
    return origin.replace(condition[0], String(diffYears)).replace(")", "");
}
/** Replaces variable value with the corresponding condition. */
export function existValue(condition, values = {}, formatKeyValueType) {
    var _a;
    let localCondition = condition;
    let valueToReturn = condition;
    const dataArray = condition === null || condition === void 0 ? void 0 : condition.split(/[^a-zA-Z0-9À-ÿ_ ]+/).map(item => item.trim().replace(/^'(.*)'$/, '$1')).filter(item => item.length > 0);
    for (const value of Object.keys(values) || []) {
        if (dataArray === null || dataArray === void 0 ? void 0 : dataArray.includes(value)) {
            if (localCondition.includes(`false`)) {
                localCondition = condition;
            }
            switch (formatKeyValueType[value]) {
                case "BOOLEAN":
                    localCondition = localCondition.replaceAll(value, `${values[value]}`.replaceAll("false", "0").replaceAll("true", "1"));
                    break;
                case "NUMBER":
                case "INTEGER_ZERO_OR_POSITIVE":
                    valueToReturn = valueToReturn.replaceAll(`'${value}'`, String(Number((_a = values[value]) !== null && _a !== void 0 ? _a : 0)));
                    if (!/[a-zA-Z]/.test(valueToReturn)) {
                        localCondition = valueToReturn;
                    }
                    else {
                        localCondition = "0";
                    }
                    break;
                default:
                    localCondition = localCondition.replaceAll(value, `${values[value]}`);
                    break;
            }
        }
    }
    return localCondition;
}
/** Gets the  valueType for variables of a section. */
export function getValueTypeVariable(variables, variable) {
    let variableType = "";
    variables === null || variables === void 0 ? void 0 : variables.map((section) => {
        var _a;
        (_a = section === null || section === void 0 ? void 0 : section.fields) === null || _a === void 0 ? void 0 : _a.map((sectionVar) => {
            if (sectionVar.name === variable.variable) {
                variableType = sectionVar.valueType;
            }
        });
    });
    return variableType;
}
