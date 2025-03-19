import { useDataMutation } from "@dhis2/app-runtime";

const postEvent: any = {
    resource: 'tracker',
    type: 'create',
    data: ({ data }: any) => data,
    params: ({ params }: any) => params
}

const useUploadEvents = () => {
    const params = {
        async: false,
        atomicMode: "OBJECT",
        reportMode: "FULL"
    }

    const [mutate,] = useDataMutation(postEvent)

    async function uploadValues(postData: any, importMode: string, importStrategy: string) {
        return await mutate({ data: postData, params: { ...params, importStrategy, importMode } })
    }

    return { uploadValues }
}

export default useUploadEvents
