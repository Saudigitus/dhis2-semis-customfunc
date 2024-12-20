export declare function generateAttendanceDays({ unavailableDays }: {
    unavailableDays: (date: Date) => boolean;
}): {
    getValidDaysToExport: (sDate: Date, eDate: Date) => {
        schoolDay: boolean;
        date: string;
    }[];
};
