import useDataStoreKey from "../dataStore/useDataStoreKey";

const useGetUsedProgramStages = ({ sectionType }: { sectionType: "student" | "staff" }) => {
    const { performance, "final-result": finalResult } = useDataStoreKey({ sectionType });

    const performanceProgramStages = performance?.programStages?.map((programStage) => programStage?.programStage) ?? [];

    return [...performanceProgramStages, finalResult?.programStage]
}

export { useGetUsedProgramStages }