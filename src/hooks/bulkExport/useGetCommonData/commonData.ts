import { useGetEnrollmentData } from "../../enrollmentDetails/useGetEnrollmentDetails"
import { useGetEvents } from "../../events/useGetEvents"
import { ExportData } from "../../../types/bulk/bulkOperations"

export function getCommonSheetData(props: ExportData) {
    const { getEvents } = useGetEvents()
    const { orgUnit, eventFilters = [], selectedSectionDataStore } = props
    const { getEnrollmentDetails } = useGetEnrollmentData({ ...props })

    async function getData() {
        const events = await getEvents({
            program: selectedSectionDataStore?.program as unknown as string,
            programStage: selectedSectionDataStore?.registration.programStage,
            fields: "trackedEntity,enrollment,orgUnit,program",
            filter: eventFilters,
            orgUnit,
            skipPaging: true,
            ouMode: 'SELECTED',
            order: selectedSectionDataStore?.defaults.defaultOrder
        })

        const enrollmentDetails = await getEnrollmentDetails(events)

        return enrollmentDetails
    }

    return { getData }
}