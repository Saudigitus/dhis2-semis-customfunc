
import { useUrlParams } from "./useQueryParams";

const useGetSectionTypeLabel = (): { sectionName: "student" | "staff" } => {
    const { urlParameters } = useUrlParams()
    const sectionType = (urlParameters().sectionType ?? 'student') as "student" | "staff";

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
