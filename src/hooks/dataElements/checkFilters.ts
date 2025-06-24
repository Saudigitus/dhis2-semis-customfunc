import { useUrlParams } from "../commons/useQueryParams"

export function useCheckFilters({ filters }: { filters: { code: string, ulrParam: string, dataElement?: string; order?: number; }[] }) {
    const { useQuery } = useUrlParams()

    function areAllSelected(): boolean {
        for (const filter of filters) {
            const query = useQuery().get(filter?.ulrParam || filter?.code)

            if (!query || query.length === 0) {
                return false
            }
        }

        return true
    }

    return { areAllSelected }
}