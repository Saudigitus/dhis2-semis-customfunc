export declare function useGetProgramRules(programs: string[]): {
    loadingPRules: boolean;
    refetch: import("@dhis2/app-service-data/build/types/types").QueryRefetchFunction;
    errorPRules: boolean;
};
