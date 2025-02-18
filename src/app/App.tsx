import React, { useEffect } from 'react'
import { useHeader } from '../hooks/table/useHeader'
import { useTableData } from '../hooks/table/useGetTableData'
import program from '../program.json'
import dataStore from '../dataStore.json'

function MyApp() {
    const { columns } = useHeader({ dataStoreData: dataStore[0] as unknown as any, module: 'final-result', programConfigData: program as unknown as any, tableColumns: [] })
    const { getData, tableData } = useTableData({ module: "final_result", selectedDataStore: dataStore[0] as unknown as any })
    console.log(columns,tableData)

    useEffect(() => {
        void getData({ page: 1, pageSize: 10, program: program.id as string, orgUnit: "Shc3qNhrPAz", baseProgramStage: dataStore[0]?.registration?.programStage as string, attributeFilters: [], dataElementFilters: [`${dataStore[0]?.registration?.academicYear}:in:2023`] })
    }, [])

    return (
        <div>
            Hello world!
        </div>
    )

}
export default MyApp
