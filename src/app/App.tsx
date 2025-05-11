import React, { useEffect } from 'react'
import { useHeader } from '../hooks/table/useHeader'
import { useTableData } from '../hooks/table/useGetTableData'
import program from '../program.json'
import dataStore from '../dataStore.json'
import { Modules } from 'dhis2-semis-types'

function MyApp() {
    // const { getData, tableData } = useTableData({ module: Modules.Transfer })
    // const { columns } = useHeader({ dataStoreData: dataStore[0], programConfigData: program, tableColumns: [], programStage: dataStore[0]?.attendance?.programStage });

    // useEffect(() => {
    //     getData({
    //         baseProgramStage: dataStore[0].registration.programStage,
    //         orgUnit: "Shc3qNhrPAz",
    //         program: program.id,
    //         otherProgramStage: dataStore[0]?.transfer.programStage,
    //         occurredAfter: "2024-03-03",
    //         occurredBefore: "2024-03-20",
    //         page: 1,
    //         pageSize: 15,
    //         // dataElementFilters: [`${dataStore[0].registration.academicYear}:in:2023`],
    //         attendanceConfig: dataStore[0].attendance
    //     })
    // },
    //     []
    // )

    // console.log(tableData)
    return (
        <div>
        </div>
    )

}
export default MyApp
