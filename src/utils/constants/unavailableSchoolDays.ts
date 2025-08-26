import { format } from "date-fns";

export const unavailableSchoolDays = (config: any) => {

    function unavailableDays(date: Date) {
        if (isHoliday(date, config.holidays)) {
            return true
        }

        if (isweekDayDisabled(date, config.weekDays)) {
            return true
        }

        if (isClassPeriod(date, config.classPeriods)) {
            return false
        }

        return true
    }

    function isweekDayDisabled(date: Date, weekdays: Record<string, boolean>) {
        if (!weekdays[WeekDays[date.getDay()]]) {
            return true
        }
    }

    function isHoliday(date: Date, holidays: Array<{ date: string, event: string }>) {
        const formatDate = format(date, "yyyy-MM-dd")

        if (holidays.findIndex(h => h.date === formatDate) > -1) {
            return true
        }
    }

    function isClassPeriod(date: Date, classPeriods: Array<{ startDate: string, endDate: string }>) {
        if (classPeriods.findIndex((h) => (new Date(h.startDate) <= date && new Date(h.endDate) >= date)) > -1) {
            return true
        }
    }

    return {
        unavailableDays
    }
}

enum WeekDays {
    sunday = 0,
    monday = 1,
    tuesday = 2,
    wednesday = 3,
    thursday = 4,
    friday = 5,
    saturday = 6
}
