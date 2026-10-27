import { useRecoilValue } from 'recoil';
import { sysInfoState } from '../../schema/infoSchema';

export function getSysInfo() {
    const sysInfo = useRecoilValue(sysInfoState);

    return { platformVersion: sysInfo }
}
