import { format } from "date-fns";
import { unavailableSchoolDays } from "../../../utils/constants/unavailableSchoolDays";
/// Data Store for School Calendar
// @TODO: Implement school calendar data store
// import { schoolCalendarData } from "../../drafts/schoolCalendar";

export function generateAttendanceDays() {
    const { unavailableDays } = unavailableSchoolDays({})

    const getValidDays = (date: Date) => {
        let validDays: any[5] = []
        let counter = 0

        do {
            let currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - counter)

            if (!unavailableDays(currentDate)) validDays.unshift({ schoolDay: true, date: format(currentDate, "yyyy-MM-dd") })
            else validDays.unshift({ schoolDay: false, date: format(currentDate, "yyyy-MM-dd") })

            counter++
        } while (validDays.length < 5)

        return validDays
    }

    return { getValidDays }
}