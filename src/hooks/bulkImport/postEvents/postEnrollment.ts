import { importData, importStrategy } from "../../../types/bulk/bulkOperations";
import { useState } from 'react'
import { useGetEvents } from "../../events/useGetEvents";
import { DataStoreRecord } from "../../../types/dataStore/DataStoreConfig";
import useUploadEvents from "../../events/useUploadEvents";
import { splitArrayIntoChunks } from "../../../utils/common/splitArray";
import { importSummary } from "../../../utils/common/getImportSummary";

export function postEnrollmentData({ setStats }: { setStats: (args: any) => void }) {
    const { getEvents, error: eventsError } = useGetEvents()
    const { uploadValues } = useUploadEvents()

    async function postEnrollments(
        enrollments: any[],
        excelData: any,
        importMode: importData["importMode"],
        program: string,
        updating: boolean,
        dataStore: DataStoreRecord,
        orgUnit: string
    ) {
        let copyData = [...enrollments], updatedStats: any = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] }


        if (updating) {
            const teis = excelData.map((x: any) => {
                return { tei: x.Ids.trackedEntity, orgUnit: x.Ids.orgUnit, enrollment: x.Ids.enrollment }
            })

            for (let index = 0; index < teis.length; index++) {
                await getEvents({
                    program,
                    orgUnit: teis[index]?.orgUnit,
                    ouMode: "SELECTED",
                    programStage: dataStore["socio-economics"].programStage,
                    fields: "event,trackedEntity,enrollment,dataValues[dataElement,value]",
                    trackedEntity: teis[index]?.tei,
                    skipPaging: true
                }).then((resp: any[]) => {
                    let thisTeiEvent = resp.find(x => x.enrollment === copyData[index].enrollment)
                    const { attributes, ...rest } = copyData[index]

                    copyData[index] = {
                        orgUnit: teis[index]?.orgUnit,
                        trackedEntity: teis[index]?.tei,
                        trackedEntityType: dataStore.trackedEntityType,
                        attributes: attributes,
                        enrollments: [{
                            ...rest,
                            events: [...(thisTeiEvent ? [{ ...copyData[index].events[0], event: thisTeiEvent.event }] : [])]
                        }]
                    }
                })
            }
        } else {
            for (let index = 0; index < copyData.length; index++) {
                const { ...props } = copyData[index]

                copyData[index] = {
                    trackedEntityType: dataStore.trackedEntityType,
                    orgUnit: orgUnit,
                    enrollments: [{
                        ...props,
                    }]
                }
            }
        }

        const chunks = splitArrayIntoChunks(copyData, 50);

        for (const chunk of chunks) {
            const response = await uploadValues({ trackedEntities: chunk }, importMode, importStrategy.CREATE);
            updatedStats = importSummary(response, updatedStats)
        }

        setStats(updatedStats)
    }

    return { postEnrollments }
}