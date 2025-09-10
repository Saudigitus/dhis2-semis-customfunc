import { useState } from 'react'
import { useGetEvents } from '../events/useGetEvents'
import useShowAlerts from '../commons/useShowAlert'
import { useSearchTei } from './useSearchTei'
import { formatResponseData } from '../../utils/tei/formatResponseData'
import { attributes } from '../../utils/table/rows/formatRowsData'
import { useUrlParams } from '../commons/useQueryParams'

export default function useSearchEnrollments(props: any) {
    const { urlParameters } = useUrlParams()
    const { school } = urlParameters
    const { show } = useShowAlerts()
    const { getEvents } = useGetEvents()
    const { getTeiSearch } = useSearchTei()
    const { registration, program, socioEconomics } = props
    const [enrollmentValues, setEnrollmentValues] = useState<any[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<boolean>(false)
    const [totalResults, setTotalResults] = useState<any>(null);

    const getEnrollmentsData = (filters: string, setShowResults: any) => {
        const teisWithRegistrationEvents: any[] = [];
        const fields: string = "event,trackedEntity,enrollment,occurredAt,dataValues[dataElement,value],orgUnitName,orgUnit"
        setLoading(true)

        getTeiSearch(program, filters, school!)
            .then(async (teiResponse: any) => {
                const data = teiResponse?.results?.instances ? teiResponse?.results?.instances : teiResponse?.results?.trackedEntities

                for (const tei of data) {
                    let socioEconomicsResponse: any = {}

                    const registrationResponse = await getEvents({
                        program,
                        programStage: registration.programStage as unknown as string,
                        filter: [`${tei.trackedEntity}`],
                        fields
                    })
                    const events = registrationResponse?.results?.instances ? registrationResponse?.results?.instances : registrationResponse?.results?.events
                    if (socioEconomics)
                        socioEconomicsResponse = await getEvents({
                            program,
                            programStage: socioEconomics.programStage as unknown as string,
                            filter: [`${tei.trackedEntity}`],
                            fields
                        })

                    const registrationEvents = formatResponseData("WITHOUT_REGISTRATION", events)
                    const socioEconomicsEvents = formatResponseData("WITHOUT_REGISTRATION", socioEconomicsResponse?.results?.instances ? socioEconomicsResponse?.results?.instances : socioEconomicsResponse?.results?.events)
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