import { format } from "date-fns";

/** A function to remove characters that are not reconized on Js to make possible to run eval() function. */
function removeSpecialCharacters(text: string | undefined) {
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
function replaceConditionVariables(condition: string | undefined, variables: Record<string, string | undefined>) {
    if (!condition)
        return condition;

    /** Regex to capture full words outside of single quotes */
    const regex = /(\b\w+\b)(?=(?:[^']*'[^']*')*[^']*$)/g;

    /** Replacement */
    const newcondition = condition.replace(regex, (match) => {
        return variables[match] !== undefined ? `'${variables[match]}'` : match;
    });

    return newcondition;
}

/** Gets function name of the program rule. */
function getFunctionExpression(condition: string | undefined) {
    return condition?.split("d2:")?.[1]?.split("(")[0];
}

/** Replaces variables ids with specific value sent from the component which implements the rule. */
function replaceEspecifValue(values: Record<string, any>, variables: Record<string, string>, variable: string) {
    if (values.hasOwnProperty(variables[variable])) {
        if (values[variables[variable]] != false) {
            return `'${values[variables[variable]]}'`;
        }
    }

    return false;
}

/** Gets the  valueType for variables of a section. */
function getValueTypeVariable(variables: any, variable: any) {
    let variableType = ""
    variables?.map((section: any) => {
        section?.fields?.map((sectionVar: any) => {
            if (sectionVar.name === variable.variable) {
                variableType = sectionVar.valueType
            }
        });
    });
    return variableType
}

export { removeSpecialCharacters, replaceConditionVariables, getFunctionExpression, replaceEspecifValue, getValueTypeVariable }