// Row "Class record status" of the attendance files, written by the export under the dates: the
// status of the class attendance record of each day, as "Take attendance" on screen (ACTIVE = in
// progress, COMPLETED = completed). It is not a person. The same text is used by
// dhis2-semis-components (export and import of the row).
export const CLASS_RECORD_ROW = "Class record status"
export const CLASS_RECORD_STATUSES = ["ACTIVE", "COMPLETED"]
const NON_SCHOOL_DAY = "Non School Day"

const text = (value: any) => value === undefined || value === null ? "" : String(value).trim()

export function isClassRecordRow(row: any): boolean {
    if (row?.Ids?.trackedEntity) return false
    return Object.values(row ?? {}).some((section: any) => section && typeof section === "object" && text(section.ref) === CLASS_RECORD_ROW)
}

// A day of the row may be empty, a non-school day, ACTIVE or COMPLETED (any letter case).
export function classRecordErrors(row: any): { key: string, error: string }[] {
    const days = row?.Attendance ?? {}
    return Object.keys(days)
        .filter(day => text(days[day]) !== "" && text(days[day]) !== NON_SCHOOL_DAY && !CLASS_RECORD_STATUSES.includes(text(days[day]).toUpperCase()))
        .map(day => ({ key: day, error: `"${text(days[day])}" is not a valid class record status (${CLASS_RECORD_STATUSES.join(" or ")})` }))
}
