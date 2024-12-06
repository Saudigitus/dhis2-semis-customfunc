import { format } from "date-fns"
import { importData, importStrategy } from "../../../types/bulk/bulkOperations"
import { importSummary } from "../../../utils/common/getImportSummary"
import { splitArrayIntoChunks } from "../../../utils/common/splitArray"
import { useGetEvents } from "../../events/useGetEvents"
import useUploadEvents from "../../events/useUploadEvents"

export function postAttendanceValues({ setStats }:{ setStats: (args: any) => void }) {
    const { uploadValues } = useUploadEvents()
    const { getEvents, error: eventsError } = useGetEvents()
    let updatedStats: any = { stats: { ignored: 0, created: 0, updated: 0, total: 0 }, errorDetails: [] }

    async function postAttendance(
        events: any[],
        programStageName: string,
        programStageId: string,
        excelData: any[],
        program: string,
        importMode: importData["importMode"]
    ) {
        let values: any = { CREATE: [], UPDATE: [] }
        const keys = Object.keys(values)

        for (const student of excelData as unknown as []) {
            const { enrollment, orgUnit, trackedEntity } = (student as unknown as any).Ids
            const days = Object.keys(student[programStageName])
            const filter = {
                occurredAfter: days[0],
                occurredBefore: days[days.length - 1]
            }

            await getEvents({
                program,
                ...filter,
                orgUnit,
                ouMode: "SELECTED",
                programStage: programStageId,
                fields: "event,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]",
                trackedEntity: trackedEntity,
                skipPaging: true
            }).then((resp: any[]) => {

                let thisTeiEvents = events.filter(x => x.enrollment === enrollment)
                let alreadyExistingEvents: any = {}

                resp?.filter(x => x.enrollment === enrollment).map((x) => {
                    alreadyExistingEvents[format(new Date(x.occurredAt), 'yyyy-MM-dd')] = x.event
                })

                thisTeiEvents.forEach(event => {
                    if (alreadyExistingEvents[event.occurredAt]) {
                        values.UPDATE.push({ ...event, event: alreadyExistingEvents[event.occurredAt] });
                    } else {
                        values.CREATE.push(event);
                    }
                });
            })
        }

        for (const key of keys) {
            const chunks = splitArrayIntoChunks(values[key], 50);

            for (const chunk of chunks) {
                const response = await uploadValues({ events: chunk }, importMode, (importStrategy as unknown as any)[key]);
                updatedStats = importSummary(response, updatedStats)
            }
        }

        setStats(updatedStats)
    }

    return { postAttendance }
}