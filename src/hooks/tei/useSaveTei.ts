import { useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime"
import useShowAlerts from '../commons/useShowAlert';

const SAVE_TEI: any = {
    resource: "tracker",
    type: 'create',
    data: ({ data }: any) => data,
    params: {
        async: false,
        importStrategy: 'CREATE_AND_UPDATE'
    }
}

export function useSaveTei():any {
    const engine = useDataEngine()
    const { hide, show } = useShowAlerts()
    const [error, setError] = useState<boolean>()
    const [response, setResponse] = useState<any>()
    const [loading, setLoading] = useState<boolean>()

    const saveTei = async ({ data, messages, handleComplete }: { data: any, messages: { error: string, sucess: string }, handleComplete?: () => void }) => {
        setLoading(true)
        return await engine.mutate(SAVE_TEI, {
            variables: { data },
            onComplete: (response) => {
                setResponse(response)
                setLoading(false)
                show({ message: messages.sucess, type: { success: true } })

                if (handleComplete) {
                    handleComplete()
                }
            },
            onError: (error) => {
                setError(true)
                setLoading(false)
                show({
                    message: `${messages.error}: ${error.message}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
            }
        })
    }

    return { saveTei, loading, error, response }
}