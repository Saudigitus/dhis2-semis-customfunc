import { useUrlParams } from "./useQueryParams";

const useGetSectionTypeLabel = (): any => {
    const { urlParameters } = useUrlParams()
    const { sectionType } = urlParameters()

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
