
import { useState } from "react";
import { GetTableDataProps, TableDataProps } from "../../types/table/tableDataProps";
import { useModulesData } from "./useModulesData";
import { Modules } from "dhis2-semis-types";

export function useTableData({ module }: { module: Modules }) {
    const { getBasicData, getStageData } = useModulesData()
    const [loading, setLoading] = useState<boolean>(false)
    const [tableData, setTableData] = useState<{ data: TableDataProps[], pagination: any }>({ data: [], pagination: {} })


    async function getData(tableDataProps: GetTableDataProps) {
        const { orgUnit } = tableDataProps;

        if (orgUnit !== null) {
            setLoading(true);
            const { formattedBasicTableData, pagination } = await getBasicData(tableDataProps)
            try {
                switch (module) {
                    case Modules.Enrollment: {
                        setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                        break;
                    }
                    case Modules.Attendance: {
                        const { otherProgramStage, ...rest } = tableDataProps
                        if (otherProgramStage) {
                            const { formattedStagedData } = await getStageData({
                                formattedBasicTableData,
                                tableDataProps: { ...rest, baseProgramStage: otherProgramStage! },
                                module
                            });

                            setTableData({ pagination: pagination, data: [...formattedStagedData] });
                        } else {
                            setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                        }
                        break;
                    }
                    case Modules.Performance: {
                        const { otherProgramStage, ...rest } = tableDataProps
                        if (otherProgramStage) {
                            const { formattedStagedData } = await getStageData({
                                formattedBasicTableData,
                                tableDataProps: { ...rest, baseProgramStage: otherProgramStage! },
                                module
                            });
                            setTableData({ pagination: pagination, data: [...formattedStagedData] });
                        } else {
                            setTableData({ pagination: pagination, data: [...formattedBasicTableData] });
                        }
                        break;
                    }
                    case Modules.Transfer: {
                        // const { formattedBasicTableData } = await getBasicData(tableDataProps);
                        // setTableData([...formattedBasicTableData]);
                        break;
                    }
                    case Modules.Final_Result: {
                        const { otherProgramStage, ...rest } = tableDataProps
                        const { formattedStagedData } = await getStageData({
                            formattedBasicTableData,
                            tableDataProps: { ...rest, baseProgramStage: otherProgramStage! },
                            module
                        });
                        setTableData({ pagination: pagination, data: [...formattedStagedData] });
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
