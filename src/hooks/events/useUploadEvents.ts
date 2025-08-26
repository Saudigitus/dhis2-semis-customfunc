import { useDataEngine } from "@dhis2/app-runtime";

const postEvent: any = {
    resource: 'tracker',
    type: 'create',
    data: ({ data }: any) => data,
    params: ({ params }: any) => params
}

const useUploadEvents = () => {
    const engine = useDataEngine();

    const params = {
        async: false,
        atomicMode: "OBJECT",
        reportMode: "FULL"
    }

    async function uploadValues(postData: any, importMode: string, importStrategy: string) {
        try {
            const response = await engine.mutate(postEvent, {
                variables: {
                    data: postData,
                    params: { ...params, importStrategy, importMode }
                }
            });
            return response;
        } catch (error) {
            throw error
        }
    }

    return { uploadValues }
}

export default useUploadEvents
