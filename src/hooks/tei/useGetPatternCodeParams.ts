import { useGetOrgUnitDetails } from "../orgUnit/useGetOrgUnitDetails"

export const useGetPatternCodeParams = () => {
    const { getOrgUnitDetails } = useGetOrgUnitDetails()

    const getPatternCodeParams = async ({ pattern, orgUnit, params }:
        { pattern: string, orgUnit: string, params: Record<string, string> }) => {
        if (pattern.includes("ORG_UNIT_CODE")) {
            const orgUnitCode = await getOrgUnitDetails({ orgUnit, params: { fields: "code" } })

            if (orgUnitCode?.results?.code) {
                params = { ORG_UNIT_CODE: orgUnitCode?.results?.code }
            }
        }

        return params
    }

    return { getPatternCodeParams }
}