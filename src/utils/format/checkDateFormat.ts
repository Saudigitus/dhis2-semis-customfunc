import { format, isValid, parse } from 'date-fns';

type DateValidationIssue = "FORMAT" | "VALUE"

export function getDateValidationIssue(dateString: string): DateValidationIssue | null {
    const formatString = "yyyy-MM-dd"
    const normalizedDate = typeof dateString === 'string' ? dateString.trim() : "";

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        return "FORMAT";
    }

    const parsedDate = parse(normalizedDate, formatString, new Date());
    if (!isValid(parsedDate) || format(parsedDate, formatString) !== normalizedDate) {
        return "VALUE";
    }

    return null;
}

export function isDateFormatValid(dateString: string): boolean {
    return getDateValidationIssue(dateString) === null;
}
