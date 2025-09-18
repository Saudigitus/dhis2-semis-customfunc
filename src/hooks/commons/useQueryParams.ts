import { useSearchParams } from "react-router-dom";
import React from "react";

const useUrlParams = (keysToExclude?: string[]) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const add = (key: string, value: string) => {
        searchParams.set(key, value);
        setSearchParams(searchParams);
    };

    const remove = (key: string) => {
        searchParams.delete(key);
        setSearchParams(searchParams);
    };

    const filteredQueryString = React.useMemo(() => {
        const clone = new URLSearchParams(searchParams.toString());
        keysToExclude?.forEach((key) => clone.delete(key));
        return clone.toString();
    }, [searchParams, keysToExclude]);

    const query = React.useMemo(() => new URLSearchParams(searchParams), [searchParams]);

    const urlParameters = React.useMemo(
        () => ({
            school: query.get("school"),
            schoolName: query.get("schoolName"),
            academicYear: query.get("academicYear"),
            sectionType: query.get("sectionType"),
            grade: query.get("grade"),
            class: query.get("class"),
            position: query.get("position"),
            employmentType: query.get("employmentType"),
            programStage: query.get("programStage"),
            attendanceMode: query.get("attendanceMode"),
            selectedDate: query.get("selectedDate"),
        }),
        [filteredQueryString]
    );

    return { add, remove, useQuery: query, urlParameters };
};

export { useUrlParams };
