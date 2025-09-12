import { useUrlParams } from "../commons/useQueryParams"

export function useCheckFilters({ filters }: { filters: { code: string, ulrParam: string, dataElement?: string; order?: number; }[] }) {
    const { useQuery } = useUrlParams()

    const getParamValue = (param: any) => useQuery.get(param?.ulrParam || param?.code)

    function areAllSelected(): boolean {
        for (const filter of filters) {
            const query = getParamValue(filter)

            if (!query || query.length === 0)
                return false
        }

        return true
    }

    function getFilters(): string[][] {
        const selectedFilters: string[][] = []
        for (const filter of filters) {
            const query = getParamValue(filter)

            if (query && query != undefined && query != null)
                selectedFilters.push([`${filter?.dataElement}:in:${query}`])
        }

        return selectedFilters
    }

    function getUrlParamsAsObject(): Record<string, string> {
        const selectedFilters: Record<string, string> = {}
        for (const filter of filters) {
            const query = getParamValue(filter)

            if (query && query != undefined && query != null)
                selectedFilters[`${filter?.ulrParam}`] = query
        }

        return selectedFilters
    }

    return { areAllSelected, getFilters, getUrlParamsAsObject }
}