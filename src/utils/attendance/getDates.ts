import { format } from "date-fns"
import { useRecoilValue } from "recoil"
import { sysInfoState } from "../../schema/infoSchema"

export function useIncrementDays() {
    const apiVersion = useRecoilValue(sysInfoState)

    const getDate = ({ selectedDate, incrementNumber = 1 }: { selectedDate: Date, incrementNumber?: number }): string => {
        const pattern = /^2\.40/;

        if (pattern.test(apiVersion))
            return format(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + incrementNumber), "yyyy-MM-dd")
        else
            return format(new Date(selectedDate), "yyyy-MM-dd")
    }

    return { getDate }
}