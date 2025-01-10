
import { useUrlParams } from "./useQueryParams";

const useGetSectionTypeLabel = () => {
    const { urlParameters } = useUrlParams()
    const sectionType = urlParameters().sectionType ?? 'student';

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
