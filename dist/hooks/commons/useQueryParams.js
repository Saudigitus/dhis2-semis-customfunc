import { useSearchParams } from 'react-router-dom';
import React from 'react';
const useParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const add = (key, value) => {
        searchParams.set(key, value);
        setSearchParams(searchParams);
    };
    const remove = (key) => {
        searchParams.delete(key);
        setSearchParams(searchParams);
    };
    const useQuery = () => {
        return React.useMemo(() => new URLSearchParams(searchParams), [searchParams]);
    };
    const urlParamiters = () => {
        return {
            school: useQuery().get('school'),
            schoolName: useQuery().get('schoolName'),
            academicYear: useQuery().get('academicYear'),
            sectionType: useQuery().get('sectionType'),
            grade: useQuery().get('grade'),
            class: useQuery().get('class'),
            position: useQuery().get('position'),
            employmentType: useQuery().get('employmentType'),
            programStage: useQuery().get('programStage'),
        };
    };
    return { add, remove, useQuery, urlParamiters };
};
export { useParams };
