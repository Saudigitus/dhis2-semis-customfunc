import { CustomAttributeProps, DataStoreProps, ProgramConfig, VariablesTypes } from "dhis2-semis-components";
import { formatVariables } from "./formatVariables";

interface FormatHeadersProps {
    programConfigData: ProgramConfig[0]
    dataStoreData: DataStoreProps[0]
    tableColumns: CustomAttributeProps[]
    otherHeaders?: CustomAttributeProps[]
}
export function formatHeaders({ programConfigData, dataStoreData, tableColumns = [], otherHeaders }: FormatHeadersProps): CustomAttributeProps[] {

    const headerResponse = () => {
        const originalData = ((programConfigData?.programStages?.find((programStge: any) => programStge.id === dataStoreData?.registration?.programStage)) ?? {} as any)

        const columnsToDisplay = 
        formatVariables({ variables: programConfigData?.programTrackedEntityAttributes as [], type: VariablesTypes.Attribute })
        ?.concat(
            Object.keys(originalData)?.length > 0
                ? formatVariables({ variables: originalData?.programStageDataElements, type: VariablesTypes.DataElement}) as []
                : []
        )
        .concat(otherHeaders as [] ?? []) 
         || []

        return tableColumns?.length > 0 ? tableColumns : columnsToDisplay
    };

    return headerResponse();
}
