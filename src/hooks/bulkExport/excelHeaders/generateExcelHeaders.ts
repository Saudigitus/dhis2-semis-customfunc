import { GenerateHeaders } from "../../../types/bulk/bulkOperations";
import { modules } from "../../../types/common/moduleTypes";
import { generateAttendanceDays } from "../../../utils/attendance/generateAttendanceDays";
import { dfHeaders } from "../../../utils/constants/dfHeaders";
import { getFilterLables } from "../../../utils/format/getFilterLables";

export function generateHeaders(props: GenerateHeaders) {
    const {
        empty,
        module,
        programConfig,
        stagesToExport,
        sectionType,
        selectedSectionDataStore,
        withSocioEconomics,
        isSchoolDay,
        endDate,
        startDate
    } = props
    const { getValidDaysToExport } = generateAttendanceDays({ unavailableDays: isSchoolDay as unknown as (args: Date) => boolean })

    function getHeaders() {
        let formatedHeaders: any[] = [], toGenerate: any[] = []
        const Profile = (sectionType ?? '').substring(0, 1).toUpperCase() + (sectionType ?? '').substring(1, (sectionType ?? '').length) + ' profile'
        let defaultLockedHeaders: any = [Profile, "Ids"], filters: any = {}
        const stageHeaders = [selectedSectionDataStore.registration.programStage,
        ...((withSocioEconomics || module === modules.enrollment) ? [selectedSectionDataStore["socio-economics"].programStage] : []),
        ...(module != modules.enrollment ? stagesToExport : [])
        ]
        const colors = {
            [selectedSectionDataStore.registration.programStage]: "FCE5CD",
            [selectedSectionDataStore["socio-economics"].programStage]: "FFFFC5"
        }


        for (const stageId of stageHeaders) {
            const currStage = programConfig?.programStages?.find(x => x.id == stageId)

            if (stageId === selectedSectionDataStore.attendance.programStage) {
                let section: any = {
                    name: currStage?.displayName,
                    headers: [
                        ...getValidDaysToExport(new Date(startDate as unknown as string), new Date(endDate as unknown as string)).map((day) => {
                            return {
                                header: day.date,
                                key: day.date,
                                disabled: !day.schoolDay,
                                width: 25,
                            }
                        })
                    ]
                }

                const statusDe = currStage?.programStageDataElements.find(x => x.dataElement.id === selectedSectionDataStore.attendance.status)
                filters["Attendance"] = getFilterLables(statusDe?.dataElement.optionSet.options ?? [])

                formatedHeaders.push(section)
            } else {
                let schoolKey: any = []

                if (currStage?.id === selectedSectionDataStore.registration.programStage) {
                    defaultLockedHeaders.push(currStage?.displayName)
                    const defaultHeaders = [
                        {
                            header: 'Ref',
                            key: 'ref',
                            width: 15,
                        },
                        {
                            header: 'School',
                            key: 'school',
                            width: 25,
                        },
                        {
                            header: 'Enrollment Date',
                            key: 'enrollmentDate',
                            width: 25,
                        }
                    ]

                    schoolKey = defaultHeaders
                }

                let section: any = {
                    name: currStage?.displayName,
                    headers: [...schoolKey],
                    fill: colors[(currStage as unknown as any)?.id]
                }

                currStage?.programStageDataElements.map((de) => {
                    if (de?.dataElement?.optionSet?.options?.length > 0) filters[de.dataElement.id] = getFilterLables(de.dataElement.optionSet.options)
                    section = {
                        ...section, headers: [...section.headers, {
                            header: `${de?.dataElement.displayName}${de.compulsory && empty ? "*" : ""}`,
                            key: `${stageId}.${de?.dataElement?.id}`,
                            width: de?.dataElement.displayName.length > 25 ? de?.dataElement.displayName.length : 25,
                        }]
                    }
                })

                if (currStage?.id === selectedSectionDataStore.registration.programStage)
                    formatedHeaders.unshift(section)
                else formatedHeaders.push(section)
            }
        }

        const att = programConfig?.programTrackedEntityAttributes?.map(x => {
            if (x?.trackedEntityAttribute?.optionSet?.options?.length > 0) filters[x.trackedEntityAttribute.id] = getFilterLables(x?.trackedEntityAttribute?.optionSet?.options)
            if (x.trackedEntityAttribute.generated || x.trackedEntityAttribute.unique) toGenerate.push(x.trackedEntityAttribute.id)

            return {
                header: `${x.trackedEntityAttribute.displayName}${x.mandatory && empty ? "*" : ""}`,
                key: x.trackedEntityAttribute?.id,
                width: x.trackedEntityAttribute.displayName.length > 25 ? x.trackedEntityAttribute.displayName : 25,
            }
        })

        formatedHeaders.splice(1, 0, {
            name: Profile, headers: [...(att || [])], fill: 'D9EAD3'
        });

        if (!empty)
            formatedHeaders.push({
                name: "Ids",
                headers: dfHeaders
            })

        return { formatedHeaders, filters, toGenerate, defaultLockedHeaders }
    }

    return { getHeaders }
}