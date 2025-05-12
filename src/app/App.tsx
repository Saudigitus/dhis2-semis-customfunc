import { DropZone, ModalComponent } from 'dhis2-semis-components'
import React, { useState } from 'react'
import { useValidation } from '../hooks/template_validation/useValidation'
import { useValidateFile } from '../hooks/template_validation/useValidateFile'

// const program = {
//     "name": "Student",
//     "id": "wQaiD2V27Dp",
//     "programTrackedEntityAttributes": [
//         {
//             "name": "Student System ID",
//             "mandatory": true,
//             "trackedEntityAttribute": {
//                 "displayName": "System ID",
//                 "id": "G0B8B0AH5Ek"
//             }
//         },
//         {
//             "name": "Student Learner Internal ID",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Learner Internal ID",
//                 "id": "SSRTWWEPn15"
//             }
//         },
//         {
//             "name": "Student First name",
//             "mandatory": true,
//             "trackedEntityAttribute": {
//                 "displayName": "First name",
//                 "id": "gz8w04YBSS0"
//             }
//         },
//         {
//             "name": "Student Surname",
//             "mandatory": true,
//             "trackedEntityAttribute": {
//                 "displayName": "Surname",
//                 "id": "ZIDlK6BaAU2"
//             }
//         },
//         {
//             "name": "Student Gender ",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Gender ",
//                 "id": "X0vzx18XWqu"
//             }
//         },
//         {
//             "name": "Student Date of birth",
//             "mandatory": true,
//             "trackedEntityAttribute": {
//                 "displayName": "Date of birth",
//                 "id": "EPYqXuM0M2u"
//             }
//         },
//         {
//             "name": "Student Nationality",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Nationality",
//                 "id": "wGiRDfHT0hj"
//             }
//         },
//         {
//             "name": "Student Address",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Address",
//                 "id": "SwfMi3g9k4s"
//             }
//         },
//         {
//             "name": "Student Guardian's Name",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Guardian's Name",
//                 "id": "d2SES7i0fzb"
//             }
//         },
//         {
//             "name": "Student Guardian's Phone Number",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Guardian's Phone Number",
//                 "id": "tWYfZZjmYgm"
//             }
//         },
//         {
//             "name": "Student Photo",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Photo",
//                 "id": "cFYnzcqZyZ9"
//             }
//         },
//         {
//             "name": "Student Age",
//             "mandatory": false,
//             "trackedEntityAttribute": {
//                 "displayName": "Age",
//                 "id": "l1QCV36yuUy"
//             }
//         }
//     ],
//     "programStages": [
//         {
//             "name": "Enrollment details",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "Academic Year ",
//                         "id": "iDSrFrrVgmX"
//                     },
//                     "compulsory": true
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Grade",
//                         "id": "kNNoif9gASf"
//                     },
//                     "compulsory": true
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Class/Section",
//                         "id": "RhABRLO2Fae"
//                     },
//                     "compulsory": true
//                 }
//             ],
//             "id": "Ni2qsy2WJn4"
//         },
//         {
//             "name": "Socio-economics",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "Electricity in students house",
//                         "id": "sLeCSA4UMe5"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Talents",
//                         "id": "UgCcMc10Dsw"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Floor of the room in which students sleep",
//                         "id": "JIk5YtcFt7b"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have Sickle Cell Anaemia?",
//                         "id": "pCZgMl3RgiC"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have any other health issue?",
//                         "id": "vpAkX5dHhx8"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have difficulty (with self-care such as) washing all over or dressing?",
//                         "id": "RFLVyp90ITL"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Living with parents",
//                         "id": "JDODlu9eDSe"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have difficulty hearing, even if using a hearing aid?",
//                         "id": "FZZNRD0FCGF"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Means of travel to school",
//                         "id": "pmnNFDUEmwT"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have difficulty remembering or concentrating?",
//                         "id": "oLxYfrjR6B5"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6a - General bursary information: Receives bursary",
//                         "id": "SjMxl9Cwha8"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have difficulty seeing, even if wearing glasses?",
//                         "id": "HDrb9f7Ndpp"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6b - General bursary information: Source(s) of bursary",
//                         "id": "H12Bz9ilOf1"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Do you have difficulty walking or climbing steps?",
//                         "id": "k7z0gfAvLkA"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6c - General bursary information: Amount in SZL of bursary per year",
//                         "id": "wsFrk0eBZgi"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6d - Amount in SZL of bursary for School fees",
//                         "id": "DXg4BfI9BQx"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6e - Amount in SZL of bursary for Examination fees",
//                         "id": "woYJkG3KMga"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "LI6f - Amount in SZL of bursary for others (Others)",
//                         "id": "QRl2YSQXsYr"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Health Issues?",
//                         "id": "ReiryBkZcCT"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Special needs?",
//                         "id": "xOiyqnsPZS7"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Practical skills",
//                         "id": "sImY1RsfcWN"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Student Levy",
//                         "id": "OsXzFxuvQqy"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "Wi3KEZ7C3w9"
//         },
//         {
//             "name": "Attendance",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "Attendance",
//                         "id": "d0MKWRNGv0a"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Reason of absence",
//                         "id": "oLUMMT84ILM"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "Ljyrr3cktAr"
//         },
//         {
//             "name": "Term 1",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "English language",
//                         "id": "mMiLYGJJ78I"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Mathematics",
//                         "id": "qPwGZal50yH"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Science",
//                         "id": "w75mLLmHYyS"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "History",
//                         "id": "cTTpaVY6m1Q"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Visual arts",
//                         "id": "HFjLxmmXm7t"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "mBEhR2M4DRQ"
//         },
//         {
//             "name": "Term 2",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "English language",
//                         "id": "mMiLYGJJ78I"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Mathematics",
//                         "id": "qPwGZal50yH"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Science",
//                         "id": "w75mLLmHYyS"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "History",
//                         "id": "cTTpaVY6m1Q"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Visual arts",
//                         "id": "HFjLxmmXm7t"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "aDmsN3qemOA"
//         },
//         {
//             "name": "Term 3",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "English language",
//                         "id": "mMiLYGJJ78I"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Mathematics",
//                         "id": "qPwGZal50yH"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Science",
//                         "id": "w75mLLmHYyS"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "History",
//                         "id": "cTTpaVY6m1Q"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "rZGdcch2PCh"
//         },
//         {
//             "name": "Final result",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "Final decision",
//                         "id": "bsyU0WFfskG"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "hcrjYJ6Yl5F"
//         },
//         {
//             "name": "Transfer",
//             "programStageDataElements": [
//                 {
//                     "dataElement": {
//                         "displayName": "Destiny School (Transfer)",
//                         "id": "kQbquG7UivM"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Reason for transfer",
//                         "id": "ZdFo5gthBt2"
//                     },
//                     "compulsory": false
//                 },
//                 {
//                     "dataElement": {
//                         "displayName": "Transfer Status",
//                         "id": "YnwITieplwy"
//                     },
//                     "compulsory": false
//                 }
//             ],
//             "id": "uewAr6TmLkw"
//         }
//     ]
// }

// const ImportProcess = () => {
//     // const UseValidation =  useValidateFile()
//     const [open, setOpen] = useState(false)
//     const module = "attendance"
//     const [openPogress, setOpenProgress] = useState(false)
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

//     if(!loader){
//         console.log(invalidRecords, validRecords)
//     }

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
            WELLCOME
        </div>
    )

}
export default MyApp
