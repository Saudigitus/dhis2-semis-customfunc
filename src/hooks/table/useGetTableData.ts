
import { useState } from "react";
import { GetTableDataProps, TableDataProps } from "../../types/table/tableDataProps";
import { useModulesData } from "./useModulesData";
import { modules } from "../../types/common/moduleTypes";
import { selectedDataStoreKey } from "dhis2-semis-types";


export function useTableData({ module, selectedDataStore }: { module: modules, selectedDataStore: selectedDataStoreKey }) {
    const { getBasicData, getStageData } = useModulesData()
    const [loading, setLoading] = useState<boolean>(false)
    const [tableData, setTableData] = useState<TableDataProps[]>([])


    async function getData(tableDataProps: GetTableDataProps) {
        const { orgUnit } = tableDataProps;

        if (orgUnit !== null) {
            setLoading(true);
            const { formattedBasicTableData } = await getBasicData(tableDataProps)

            try {
                switch (module) {
                    case modules.enrollment: {
                        setTableData([...formattedBasicTableData]);
                        break;
                    }
                    case modules.attendance: {
                        // const { formattedBasicTableData } = await getBasicData(tableDataProps);
                        // setTableData([...formattedBasicTableData]);
                        break;
                    }
                    case modules.performance: {
                        // const { formattedBasicTableData } = await getBasicData(tableDataProps);
                        // setTableData([...formattedBasicTableData]);
                        break;
                    }
                    case modules.transfer: {
                        // const { formattedBasicTableData } = await getBasicData(tableDataProps);
                        // setTableData([...formattedBasicTableData]);
                        break;
                    }
                    case modules.final_result: {
                        const { baseProgramStage, ...rest } = tableDataProps
                        const { formattedStagedData } = await getStageData({
                            formattedBasicTableData,
                            tableDataProps: { ...rest, baseProgramStage: (selectedDataStore[modules.final_result] as unknown as any)?.programStage }
                        });
                        setTableData([...formattedStagedData]);
                        break;
                    }
                    default: {
                        // const { formattedBasicTableData } = await getBasicData(tableDataProps);
                        // setTableData([...formattedBasicTableData]);
                        console.error("Invalid module key provided");
                        break;
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        }
    }


    return {
        getBasicData,
        getData,
        tableData,
        loading
    }
}
