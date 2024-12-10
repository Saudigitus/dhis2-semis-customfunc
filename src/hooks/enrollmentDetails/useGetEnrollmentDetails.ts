import { useState } from 'react'
import { useGetTei } from '../tei/useGetTei';
import { useGetEvents } from '../events/useGetEvents';
import { ExportData } from '../../types/bulk/bulkOperations';
import { attributes, dataValues } from '../../utils/format/formatData';
import { modules } from '../../types/common/moduleTypes';
import { format } from 'date-fns';

export function useGetEnrollmentData(props: ExportData) {
    const { getTei } = useGetTei()
    const { getEvents } = useGetEvents()
    const [error, setError] = useState<boolean>(false)
    const { orgUnitName, orgUnit, eventFilters, withSocioEconomics, selectedSectionDataStore, module } = props

    const getEnrollmentDetails = async (events: any) => {
        const trackedEntityIds = events?.map((x: { trackedEntity: string }) => x.trackedEntity).join(';')

        try {
            return getTei(selectedSectionDataStore?.program as unknown as string, trackedEntityIds)
                .then(async (trackedEntityInstance: any) => {
                    let rows: any = []
                    let counter = 0

                    for (const tei of trackedEntityInstance?.results?.instances) {
                        counter++
                        let enrollment = events.find((x: any) => x.trackedEntity == tei?.trackedEntity)?.enrollment
                        let socioEconomiscData: any = []

                        const registrationData: any = await getEvents({
                            program: selectedSectionDataStore?.program as unknown as string,
                            programStage: selectedSectionDataStore?.registration.programStage as unknown as string,
                            ouMode: "SELECTED",
                            fields: "*",
                            filter: eventFilters,
                            skipPaging: true,
                            trackedEntity: tei.trackedEntity,
                            orgUnit: orgUnit
                        })

                        if (withSocioEconomics || module === modules.enrollment) {
                            socioEconomiscData = await getEvents({
                                program: selectedSectionDataStore?.program as unknown as string,
                                programStage: selectedSectionDataStore?.['socio-economics'].programStage as unknown as string,
                                ouMode: "SELECTED",
                                fields: "*",
                                filter: eventFilters,
                                skipPaging: true,
                                trackedEntity: tei.trackedEntity,
                                orgUnit: orgUnit
                            })
                        }

                        const currEnrollmentRegistration = registrationData?.find((x: any) => x.enrollment === enrollment)
                        const currEnrollmentSocioEconomics = socioEconomiscData?.find((x: any) => x.enrollment === enrollment)

                        rows = [...rows, {
                            ref: "" + counter + " ",
                            school: orgUnitName,
                            orgUnit: currEnrollmentRegistration?.orgUnit,
                            enrollmentDate: format(new Date(currEnrollmentRegistration?.occurredAt), 'yyyy-MM-dd'),
                            enrollment: enrollment,
                            trackedEntity: tei.trackedEntity,
                            ...attributes(tei?.attributes ?? []),
                            ...dataValues(currEnrollmentRegistration?.dataValues ?? [], selectedSectionDataStore?.registration.programStage as unknown as string),
                            ...dataValues(currEnrollmentSocioEconomics?.dataValues ?? [], selectedSectionDataStore?.['socio-economics'].programStage as unknown as string),
                        }]
                    }

                    return rows
                })
        }
        catch (error: any) {
            setError(error)
        }

    }

    return { getEnrollmentDetails, error }
}