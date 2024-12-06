import { useGetEvents } from "../../events/useGetEvents";
import useUploadEvents from "../../events/useUploadEvents";
import { splitArrayIntoChunks } from "../../../utils/common/splitArray";
import { importData, importStrategy } from "../../../types/bulk/bulkOperations";
import { importSummary } from "../../../utils/common/getImportSummary";
import { ProgramConfig } from "../../../types/programConfig/ProgramConfig";


export function postValues({ setStats }: { setStats: (args: any) => void }) {
    const { uploadValues } = useUploadEvents()
    const { getEvents, error: eventsError } = useGetEvents()
    let updatedStats: any = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] }

    async function postData(
        data: any[],
        excelData: any,
        importMode: importData["importMode"],
        programConfig: ProgramConfig,
        programStages: string[]
    ) {
        let copyData = [...data]
        for (const student of excelData.mapping as unknown as []) {
            const { enrollment, orgUnit, trackedEntity } = (student as unknown as any).Ids

            for (const stage of programStages) {
                await getEvents({
                    program: programConfig.id,
                    orgUnit,
                    ouMode: "SELECTED",
                    programStage: stage,
                    fields: "event,programStage,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]",
                    trackedEntity: trackedEntity,
                    skipPaging: true
                }).then((resp: any) => {
                    let event = resp.find((x: any) => x.enrollment === enrollment && x.programStage == stage)?.event
                    const index = copyData.findIndex(x => x.enrollment === enrollment && x.programStage == stage)
                    copyData[index] = { ...copyData[index], event: event }
                })
            }
        }

        const chunks = splitArrayIntoChunks(copyData, 50);

        for (const chunk of chunks) {
            const response = await uploadValues({ events: chunk }, importMode, importStrategy.UPDATE);
            updatedStats = importSummary(response, updatedStats)
        }

        setStats(updatedStats)
    }

    return { postData }
}

