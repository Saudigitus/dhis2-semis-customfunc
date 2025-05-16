import { useEffect } from "react";
import { useUrlParams } from "./useQueryParams";

const useGetSectionTypeLabel = ():any => {
    const { urlParameters } = useUrlParams()
    const {sectionType} = urlParameters()

    useEffect(() => {
        if(sectionType){

        }
    },[sectionType])

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
