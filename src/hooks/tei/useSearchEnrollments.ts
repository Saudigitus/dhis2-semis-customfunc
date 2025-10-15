import { useState } from 'react'
import { useSearchTei } from './useSearchTei'
import { DataStoreProps } from 'dhis2-semis-types'
import useShowAlerts from '../commons/useShowAlert'
import { useGetEvents } from '../events/useGetEvents'
import { attributes } from '../../utils/table/rows/formatRowsData'
import { formatResponseData } from '../../utils/tei/formatResponseData'

interface useSearchEnrollmentsProps {
    program: string,
    registration: DataStoreProps[0]["registration"],
    socioEconomics: DataStoreProps[0]["socio-economics"]
}

export default function useSearchEnrollments(props: useSearchEnrollmentsProps) {
    const { show } = useShowAlerts()
    const { getEvents } = useGetEvents()
    const { getTeiSearch } = useSearchTei()
    const [error, setError] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const { registration, program, socioEconomics } = props
    const [totalResults, setTotalResults] = useState<any>(null);
    const [enrollmentValues, setEnrollmentValues] = useState<any[]>([])

    const getEnrollmentsData = ({ filters, setShowResults, orgUnit }: { filters: string, setShowResults: any, orgUnit: string }) => {
        const teisWithRegistrationEvents: any[] = [];
        const fields: string = "event,trackedEntity,enrollment,occurredAt,dataValues[dataElement,value],orgUnitName,orgUnit"

        setLoading(true)
        getTeiSearch({ program, filters, orgUnit })
            .then(async (teiResponse: any) => {

                for (const tei of teiResponse?.results?.instances) {
                    let socioEconomicsResponse: any = {}

                    const registrationResponse = await getEvents({
                        program, programStage: registration.programStage as unknown as string, trackedEntity: tei?.trackedEntity, fields
                    })

                    if (socioEconomics)
                        socioEconomicsResponse = await getEvents({
                            program, programStage: socioEconomics.programStage as unknown as string, trackedEntity: tei?.trackedEntity, fields
                        })


                    const registrationEvents = formatResponseData("WITHOUT_REGISTRATION", registrationResponse)
                    const socioEconomicsEvents = formatResponseData("WITHOUT_REGISTRATION", socioEconomicsResponse)
                    teisWithRegistrationEvents.push({ ...tei, ownershipOu: tei?.programOwners?.[0]?.orgUnit, enrollmentsNumber: registrationEvents?.length, registrationEvents, socioEconomicsEvents, mainAttributesFormatted: attributes(tei?.attributes), ...attributes(tei?.attributes) })
                }

                setEnrollmentValues(teisWithRegistrationEvents)
                setLoading(false)
                setShowResults(true)
                setTotalResults(teiResponse.results.total || 0);
            })
            .catch((error: any) => {
                setLoading(false)
                setError(true)
                show({
                    message: `${("Could not get selected enrollment details")}: ${error.message}`,
                    type: { critical: true }
                });
            })
    }

    return { enrollmentValues, setEnrollmentValues, getEnrollmentsData, loading, error, totalResults }
}