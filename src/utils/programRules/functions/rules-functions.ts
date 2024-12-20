/** Returns years between dates. */
function d2YearsBetween(origin: string | undefined, condition: string[] | undefined): string | undefined {
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

/** Compares values in string. */
function compareLength(condition: string) {
    const results: string[] = [];
    let newcondition = 'false'

    if (condition) {
        for (const match of condition?.matchAll(/d2:length\('(.*?)'\)/g)) {
            results.push(match[1]);
        }

        for (const result of results) {
            newcondition = condition?.replace(`d2:length('${result}')`, `${result.length}`)
        }
    }

    return newcondition
}


/** Returns a sustring given the string and indexs. */
function returnSubstring(value: string) {
    const [stringToRepair, startStr, endStr] = value.replaceAll(")", "").split(",");
    const start = Number(startStr);
    const end = Number(endStr);

    const repairedString = stringToRepair.substring(start, end)

    if (!isNaN(Number.parseInt(repairedString)))
        return Number.parseInt(repairedString) as unknown as string
    else
        return `'${repairedString}'`
}

/** Verifies if a given string is a valid date. */
function isDate(str: string) {
    // Remove parentheses if they exist
    if (typeof str === 'string') {
        const cleanedStr = str?.replace(/[()]/g, '');

        // Try to create a Date object
        const date = new Date(cleanedStr);

        // Checks if the created date is valid
        return !isNaN(date.getTime());
    }
    return str;
}


export { d2YearsBetween, compareLength, returnSubstring, isDate }