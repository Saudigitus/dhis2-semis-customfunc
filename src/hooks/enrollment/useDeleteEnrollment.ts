import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";

const ENROLLMENT_MUTATION: any = {
    resource: "enrollments",
    type: 'delete',
    id: ({ id }: any) => id,
}

export function useDeleteEnrollment() {
    const engine = useDataEngine();
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<unknown>(null)


    async function deleteEnrollment(enrollment: string, onComplete?: () => void, onError?: (error?: unknown) => void) {

        return await engine.mutate(ENROLLMENT_MUTATION, { variables: { id: enrollment } })
            .then(() => {
                if (onComplete) {
                    onComplete()
                }
            }).catch((error) => {
                setError(error)
                if (onError) {
                    onError(error)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }

    return { deleteEnrollment, loading, error }
}