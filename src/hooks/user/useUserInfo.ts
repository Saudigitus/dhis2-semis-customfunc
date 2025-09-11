import { useDataEngine } from "@dhis2/app-runtime";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { UserInfoState } from "src/schema/userInfoSchema";

const QUERY = {
    userInfo: {
        resource: "me",
        fields: "*"
    }
}
export const useUserInfo = () => {
    const [loading, setloading] = useState(false)
    const engine = useDataEngine()
    const [userInfoState, setUserInfoState] = useRecoilState(UserInfoState)

    async function getUserInfo() {
        if (userInfoState?.id) {
            return
        }
        setloading(true)
        const userInfo: any = await engine.query(QUERY)
        setloading(false)
        setUserInfoState(userInfo?.userInfo)
    }


    return { userInfo: getUserInfo(), loading };
}