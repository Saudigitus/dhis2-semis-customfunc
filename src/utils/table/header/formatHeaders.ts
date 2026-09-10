import { CustomAttributeProps, DataStoreProps, ProgramConfig, VariablesTypes } from "dhis2-semis-types";
import { formatVariables } from "./formatVariables";

interface FormatHeadersProps {
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0]
    programStage?: string
}
export function formatHeaders({ programConfigData, dataStoreData, programStage }: FormatHeadersProps): CustomAttributeProps[] {
   
    const removeExistingObjects = <T extends { id: string }>(obj1: T[], obj2: T[]): T[] => {
        const existingIds = new Set(obj1.map(item => item.id));

        return obj2.filter(item => !existingIds.has(item.id));
    };

    const headerResponse = () => {
        const originalData = ((programConfigData?.programStages?.find((programStge: any) => programStge.id === dataStoreData?.registration?.programStage)) ?? {} as any)
        const secondaryData = ((programConfigData?.programStages?.find((programStge: any) => programStge.id === programStage)) ?? {} as any)

        const originalDataElements = formatVariables({ variables: originalData?.programStageDataElements, type: VariablesTypes.DataElement }) as []
        const secondaryDataElements = formatVariables({ variables: secondaryData?.programStageDataElements, type: VariablesTypes.DataElement }) as []


        const columnsToDisplay =
            formatVariables({ variables: programConfigData?.programTrackedEntityAttributes as [], type: VariablesTypes.Attribute })
                ?.concat(
                    Object.keys(originalData)?.length > 0
                        ? originalDataElements : []
                )
                .concat(Object.keys(secondaryData)?.length > 0
                    ? removeExistingObjects(originalDataElements, secondaryDataElements) : []
                )
            || []

        return columnsToDisplay
    };

    return headerResponse();
}
