declare const useParams: () => {
    add: (key: string, value: string) => void;
    remove: (key: string) => void;
    useQuery: () => URLSearchParams;
    urlParamiters: () => {
        school: string | null;
        schoolName: string | null;
        academicYear: string | null;
        sectionType: string | null;
        grade: string | null;
        class: string | null;
        position: string | null;
        employmentType: string | null;
        programStage: string | null;
    };
};
export { useParams };
