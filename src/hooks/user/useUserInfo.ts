import { useDataEngine } from "@dhis2/app-runtime";

export const useUserInfo = () => {
    const engine = useDataEngine()
    const QUERY = {
        userInfo: {
            resource: "me",
            fields: "*"
        }
    }

    async function getUserInfo() {
       const userInfo = await engine.query(QUERY)
       return userInfo?.userInfo
    }


    return { userInfo: getUserInfo() };
}