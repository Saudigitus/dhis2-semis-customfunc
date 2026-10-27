import { useDataEngine } from "@dhis2/app-runtime"
import { useState } from "react"

export const useGetOrgUnitDetails = () => {
    const engine = useDataEngine()
    const [loading, setLoading] = useState<boolean>(false)

    const getOrgUnitDetails = async ({ orgUnit, params }:
        { orgUnit: string, params: Record<string, string> }): Promise<any> => {
        setLoading(true)
        const res = await engine.query({
            results: {
                resource: `organisationUnits/${orgUnit}`,
                params: {
                    ...params
                }
            }
        })
        setLoading(false)
        return res
    }

    return { getOrgUnitDetails, loading }
}