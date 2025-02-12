import { CustomAttributeProps, DataStoreProps, ProgramConfig, VariablesTypes } from "dhis2-semis-types";
import { formatVariables } from "./formatVariables";

interface FormatHeadersProps {
    programConfigData: ProgramConfig
    dataStoreData: DataStoreProps[0]
    tableColumns: CustomAttributeProps[]
    module: keyof DataStoreProps[0]
}
export function formatHeaders({ programConfigData, dataStoreData, tableColumns = [], module }: FormatHeadersProps): CustomAttributeProps[] {

    const headerResponse = () => {
        const originalData = ((programConfigData?.programStages?.find((programStge: any) => programStge.id === dataStoreData?.registration?.programStage)) ?? {} as any)
        const secondaryData = ((programConfigData?.programStages?.find((programStge: any) => programStge.id === (dataStoreData?.[module] as unknown as any)?.programStage)) ?? {} as any)

        const columnsToDisplay =
            formatVariables({ variables: programConfigData?.programTrackedEntityAttributes as [], type: VariablesTypes.Attribute })
                ?.concat(
                    Object.keys(originalData)?.length > 0
                        ? formatVariables({ variables: originalData?.programStageDataElements, type: VariablesTypes.DataElement }) as []
                        : []
                )
                .concat(Object.keys(secondaryData)?.length > 0
                    ? formatVariables({ variables: secondaryData?.programStageDataElements, type: VariablesTypes.DataElement }) as []
                    : [])
            || []

        return tableColumns?.length > 0 ? tableColumns : columnsToDisplay
    };

    return headerResponse();
}
