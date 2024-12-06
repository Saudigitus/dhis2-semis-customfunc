import { importData } from "../../types/bulk/bulkOperations";
import { modules } from "../../types/common/moduleTypes";
import { DataStoreRecord } from "../../types/dataStore/DataStoreConfig";
import { generateAttendanceEventObjects, generateEnrollmentData, generateEventObjects } from "./createEvents/createEventsObject";
import { postAttendanceValues } from "./postEvents/postAttendance";
import { postEnrollmentData } from "./postEvents/postEnrollment";
import { postValues } from "./postEvents/postEvents";
import { useState } from 'react'

export function useImportData() {
    const [stats, setStats] = useState<any>()
    const { postData } = postValues({ setStats })
    const { postAttendance } = postAttendanceValues({ setStats })
    const { postEnrollments } = postEnrollmentData({ setStats })

    async function importData(props: importData) {
        const { excelData, importMode, updating = false, programConfig, selectedSectionDataStore, orgUnit, sectionType } = props
        const studentsData = excelData.mapping
        const profile = sectionType.substring(0, 1).toUpperCase() + sectionType.substring(1, sectionType.length) + ' profile'
        const programStages = [
            ...(
                excelData.module != modules.enrollment ?
                    (selectedSectionDataStore as unknown as any)?.[excelData.module].programStage ?
                        [(selectedSectionDataStore as unknown as any)?.[excelData.module].programStage] :
                        (selectedSectionDataStore as unknown as any)?.[excelData.module].programStages.map((x: any) => x.programStage)
                    : []
            )
        ]

        const displayNames = programConfig.programStages.filter(x => programStages.includes(x.id)).map(x => x.displayName)

        switch (excelData.module) {
            case modules.attendance:
                const { attendanceEvents } = generateAttendanceEventObjects(displayNames, studentsData, selectedSectionDataStore as unknown as DataStoreRecord)
                const attendanceDisplayName = programConfig.programStages.find(x => x.id === selectedSectionDataStore?.attendance.programStage)?.displayName

                await postAttendance(
                    attendanceEvents,
                    attendanceDisplayName as unknown as string,
                    selectedSectionDataStore?.attendance.programStage as unknown as string,
                    excelData.mapping,
                    programConfig.id,
                    importMode
                )
                break;

            case modules.enrollment:
                /**
                 * Ao se registar um novo estudante criam-se eventos de todos os program stages, excepto attendance e transfer e 
                 * ao se actualizar o estudante nao se cria nenhum evento, sendo assim, esse array terá uma lista de todos os 
                 * program stages que devem ser ignorados na hora de actualizar e/ou registar um novo estudante
                 */
                const stagesToIgnore = [
                    selectedSectionDataStore?.attendance.programStage as unknown as string,
                    selectedSectionDataStore?.transfer.programStage as unknown as string,
                    ...(updating ? [
                        selectedSectionDataStore?.["final-result"].programStage as unknown as string,
                        selectedSectionDataStore?.registration.programStage as unknown as string,
                        ...(selectedSectionDataStore?.performance.programStages.map(x => x.programStage)) as unknown as string
                    ] : [""])
                ]

                const { enrollments } = generateEnrollmentData(
                    profile,
                    programConfig,
                    stagesToIgnore,
                    studentsData,
                    orgUnit as unknown as string,
                    updating,
                )

                await postEnrollments(
                    enrollments,
                    studentsData,
                    importMode,
                    programConfig.id,
                    updating,
                    selectedSectionDataStore as unknown as DataStoreRecord,
                    orgUnit as unknown as string
                )
                break

            default:
                const { events } = generateEventObjects(displayNames, studentsData, programConfig)

                await postData(events, excelData, importMode, programConfig, programStages)
                break;
        }
    }

    return { importData, stats }
}