
import { useEffect, useState } from "react";
import { useUrlParams } from "./useQueryParams";

const useGetSectionTypeLabel = ():string => {
    const [sectionTypeLabel, setSectionTypeLabel] = useState<string|null>(null);
    const { urlParameters } = useUrlParams()
    const {sectionType} = urlParameters()

    useEffect(() => {
        if(sectionType){

        }
    },[sectionType])

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
