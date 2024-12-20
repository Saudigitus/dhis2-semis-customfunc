import { format } from "date-fns";
export function separateByMonth(headersToFormat) {
    const groupedDates = {};
    headersToFormat.forEach(dateStr => {
        const date = new Date(dateStr.header);
        const yearMonth = `${format(date, 'MMMM')}-${date.getFullYear()}`;
        if (!groupedDates[yearMonth]) {
            groupedDates[yearMonth] = [];
        }
        groupedDates[yearMonth].push(dateStr);
    });
    return groupedDates;
}
