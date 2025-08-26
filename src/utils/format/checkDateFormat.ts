import { parse, isValid } from 'date-fns';

export function isDateFormatValid(dateString: string): boolean {
    const formatString = "yyyy-MM-dd"
    
    const parsedDate = parse(dateString, formatString, new Date());
    return isValid(parsedDate);
}