import { useSchoolCalendarKey, useDataStoreKey } from "dhis2-semis-components";
import { useUrlParams } from "./useQueryParams";

export default function useGetRegitration() {
    const { useQuery, urlParameters } = useUrlParams();
    const { academicYear: academicYearId } = useSchoolCalendarKey()
    const { academicYear, sectionType } = urlParameters;
    const dataStoreData = useDataStoreKey({ sectionType })
    const { filters } = dataStoreData

    function useGetRegitrationDataElements() {

        let dataElements = [
            {
                dataElement: academicYearId,
                value: academicYear
            }
        ]

        for (const item of filters?.dataElements) {
            dataElements.push({
                dataElement: item?.dataElement,
                value: useQuery.get(item?.ulrParam)
            })
        }

        return dataElements
    }

    return { useGetRegitrationDataElements }
}