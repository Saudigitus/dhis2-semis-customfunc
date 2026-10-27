import { useShowAlerts } from "../.."
import { useGetOrgUnitDetails } from "../orgUnit/useGetOrgUnitDetails"

export const useGetPatternCodeParams = () => {
    const { show } = useShowAlerts()
    const { getOrgUnitDetails } = useGetOrgUnitDetails()

    const getPatternCodeParams = async ({ pattern, orgUnit, params, onFail }:
        { pattern: string, orgUnit: string, params: Record<string, string>, onFail: () => void }) => {
        if (pattern.includes("ORG_UNIT_CODE")) {
            const orgUnitCode = await getOrgUnitDetails({ orgUnit, params: { fields: "code" } })

            if (orgUnitCode?.results?.code) {
                params = { ORG_UNIT_CODE: orgUnitCode?.results?.code }
            }

            else {
                show({ type: { critical: true }, message: "Error on attributes auto-generator: School code not found." })
                onFail()
            }
        }

        return params
    }

    return { getPatternCodeParams }
}