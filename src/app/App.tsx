// import { DropZone, ModalComponent } from 'dhis2-semis-components'
import React, { useState } from 'react'
import { useValidation } from '../hooks/template_validation/useValidation'
import { useValidateFile } from '../hooks/template_validation/useValidateFile'
import program from "../utils/constants/programConfig.json"
// import { DropZone, ModalComponent } from 'dhis2-semis-components'

// const ImportProcess = () => {
//     const [open, setOpen] = useState(false)
//     const module = "enrollment"
//     const UseValidation = new useValidation()
//     const { validador, invalidRecords, loader, validRecords } = useValidateFile(program, 'POST')

//     const onValidation = async (file: File) => {
//         UseValidation.setModule(module as unknown as any)
//         await UseValidation.validation(file[0])
//             .then((resp) => {
//                 const { mapping, module } = resp
//                 validador({ module, data: mapping })
//             })
//             .catch((error) => {
//                 console.log(error, "ERROR")
//             })
//     }

//     // if(!loader){
//     //     console.log(invalidRecords, validRecords)
//     // }

//     return (
//         <>
//             <a style={{ width: "100%", cursor: "pointer", padding: "5px" }} onClick={(e) => {
//                 e.preventDefault()
//                 setOpen(true)
//             }}>
//                 <button>Open mport</button>
//             </a>

//             <ModalComponent
//                 children={<DropZone accept='.csv,.xlsx' onSave={(file) => onValidation(file)} />}
//                 handleClose={() => { setOpen(false) }}
//                 loading={loader}
//                 open={open}
//                 title={"Bulk Data"}
//             />
//         </>
//     )
// }

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
            "WELLCOME"
            {/* <ImportProcess/> */}
        </div>
    )

}
export default MyApp
