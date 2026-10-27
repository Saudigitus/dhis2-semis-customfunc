import { useState } from "react";
import { GetTableDataProps, TableDataProps } from "../../types/table/tableDataProps";
import { useModulesData } from "./useModulesData";
import { Modules } from "dhis2-semis-types";

export function useTableData({ module }: { module: Modules }) {
    const { getBasicData, getStageData, getAttendanceData } = useModulesData()
    const [loading, setLoading] = useState<boolean>(false)
    const [tableData, setTableData] = useState<{ data: TableDataProps[], pagination: any }>({ data: [], pagination: {} })

    async function getData(tableDataProps: GetTableDataProps) {
        setLoading(true);
        // The stages are only swapped when the caller actually requests a second stage.
        // Otherwise `baseProgramStage` would become undefined, the events query would lose
        // its program stage filter and events from every stage would be listed.
        const swapProgramStages = module == Modules.Transfer && Boolean(tableDataProps.otherProgramStage);
        const updatedProps = {
            ...tableDataProps,
            ...(swapProgramStages ?
                {
                    baseProgramStage: tableDataProps.otherProgramStage,
                    otherProgramStage: tableDataProps.baseProgramStage
                } : {})
        };

        const { formattedBasicTableData, pagination } = await getBasicData(updatedProps)

        try {
            switch (module) {
                case Modules.Enrollment: {
                    setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                    break;
                }

                case Modules.Attendance:
                    const { otherProgramStage, ...rest } = updatedProps;
                    if (otherProgramStage) {
                        const { formattedStagedData } = await getAttendanceData({
                            formattedBasicTableData,
                            tableDataProps: { ...rest, baseProgramStage: otherProgramStage! },
                            module
                        });
                        setTableData({ pagination: pagination, data: [...formattedStagedData] });
                        return { data: [...formattedStagedData], pagination }
                    } else {
                        setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                        return { data: [...formattedBasicTableData], pagination }
                    }

                case Modules.Performance: case Modules.Final_Result: case Modules.Transfer: case Modules.Transfer_Execute:{
                    const { otherProgramStage, ...rest } = updatedProps;
                    if (otherProgramStage) {
                        const { formattedStagedData } = await getStageData({
                            formattedBasicTableData,
                            tableDataProps: { ...rest, baseProgramStage: otherProgramStage! },
                            module
                        });
                        setTableData({ pagination: pagination, data: [...formattedStagedData] });
                        return { data: [...formattedStagedData], pagination }
                    } else {
                        setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                        return { data: [...formattedBasicTableData], pagination }
                    }
                }
                default: {
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


    return {
        getBasicData,
        getData,
        tableData,
        loading
    }
}
