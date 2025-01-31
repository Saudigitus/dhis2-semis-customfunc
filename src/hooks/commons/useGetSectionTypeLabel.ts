import { useUrlParams } from "./useQueryParams";

enum SectionTypeProps { 
    Student = "student", 
    Staff = "staff" 
}
const useGetSectionTypeLabel = () => {
    const { urlParameters } = useUrlParams();
    const sectionType: SectionTypeProps = urlParameters().sectionType as SectionTypeProps ?? SectionTypeProps.Student;

    return { sectionName: sectionType };
}
export default useGetSectionTypeLabel;
