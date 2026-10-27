import { useSetRecoilState } from 'recoil';
import { useDataQuery } from "@dhis2/app-runtime"
import { sysInfoState } from '../../schema/infoSchema';
import useShowAlerts from '../commons/useShowAlert';

const DATASTORE_QUERY = ({
    config: {
        resource: "system/info",
        params: {
            fields: "version"
        }
    }
})

export function useGetSysInfo() {
    const sysInfo = useSetRecoilState(sysInfoState);
    const { hide, show } = useShowAlerts()

    const { loading, error } = useDataQuery<{ config: any }>(DATASTORE_QUERY, {
        onError(error: any) {
            show({
                message: `${("Could not get sys info")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
        },
        onComplete(response: any) {
            sysInfo(response?.config?.version);
        }
    })

    return {
        loading,
        error
    }
}
