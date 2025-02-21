import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";

const ENROLLMENT_QUERY = {
    results: {
        resource: "tracker/trackedEntities",
        id: ({ id }: any) => id,
        params: {
            fields: "enrollments[enrollment]",
        }
    }
}

export function useGetTotalEnrollments() {
    const engine = useDataEngine();
    const [data, setData] = useState<unknown>(null)
    const [loading, setLoading] = useState<boolean>(false)


    async function getTotalEnrollment(trackedEntity: string) {
        setLoading(true)
        return await engine.query(ENROLLMENT_QUERY, { variables: { id: trackedEntity } })
            .then((response) => {
                setData(response)
            }).finally(() => {
                setLoading(false)
            })
    }

    return { getTotalEnrollment, data, loading }
}