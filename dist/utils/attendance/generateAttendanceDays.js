import { format } from "date-fns";
export function generateAttendanceDays({ unavailableDays }) {
    const getValidDaysToExport = (sDate, eDate) => {
        const [sYear, sMonth, sDay] = format(new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()), "yyyy-MM-dd").split('-').map(Number);
        const [eYear, eMonth, eDay] = format(new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate()), "yyyy-MM-dd").split('-').map(Number);
        for (var arr = [], currentDate = new Date(sYear, sMonth - 1, sDay); currentDate <= new Date(eYear, eMonth - 1, eDay); currentDate.setDate(currentDate.getDate() + 1)) {
            if (typeof unavailableDays === 'undefined' || !unavailableDays(currentDate))
                arr.push({ schoolDay: true, date: format(currentDate, "yyyy-MM-dd") });
            else
                arr.push({ schoolDay: false, date: format(currentDate, "yyyy-MM-dd") });
        }
        return arr;
    };
    return { getValidDaysToExport };
}
