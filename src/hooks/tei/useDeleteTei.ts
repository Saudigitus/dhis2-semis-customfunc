import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";

const DELETE_TEI_MUTATION: any = {
    resource: 'trackedEntityInstances',
    type: 'delete',
    id: ({ id }: any) => id,
}

export function useDeleteTEI() {
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)
    const engine = useDataEngine();

    async function deleteTEI(trackedEntity: string, onComplete?: () => void, onError?: (error?: unknown) => void) {
        try {
            setLoading(true)
            const response = await engine.mutate(DELETE_TEI_MUTATION, { variables: { id: trackedEntity } });
            if (onComplete) {
                onComplete()
            }
            return response;
        } catch (error) {
            setError(error)
            if (onError) {
                onError(error)
            }
        } finally {
            setLoading(false)
        }
    }

    return { deleteTEI, loading, error }
}