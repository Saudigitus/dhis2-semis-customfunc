import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";

const QUERY = {
    userInfo: {
        resource: "me",
        fields: "*"
    }
}
export const useUserInfo = () => {
    const [loading, setloading] = useState(false)
    const engine = useDataEngine()

    async function getUserInfo() {
        setloading(true)
        const userInfo = await engine.query(QUERY)
        setloading(false)
        return userInfo?.userInfo
    }


    return { userInfo: getUserInfo(), loading };
}