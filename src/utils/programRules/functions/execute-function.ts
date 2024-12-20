import { isDate } from "date-fns";
import { compareLength, d2YearsBetween, returnSubstring } from "./rules-functions";

/** Executes program rule condition or action function. */
function executeFunctionName(functionName: string | undefined, condition: string | undefined) {
    switch (functionName) {
        case "hasValue":
            return isDate(condition!) ? condition : eval(condition ?? "");

        case "yearsBetween":
            return eval(d2YearsBetween(condition, condition?.split(")")) ?? "");

        case "inOrgUnitGroup":
            return true

        case "length":
            return eval(compareLength(condition ?? ""))

        case "substring":
            let function_paramter = returnSubstring(condition?.split("d2:substring(").pop() ?? "")
            const formated_function = condition?.replaceAll(condition?.split("d2:substring(").pop() as string, function_paramter).replaceAll("d2:substring", '').replaceAll("(", '')
            return eval(formated_function as string)

        default:
            return eval(condition ?? "");
    }
}

export { executeFunctionName }