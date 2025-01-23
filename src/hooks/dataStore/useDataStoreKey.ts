import { useRecoilValue } from "recoil"
import { DataStoreState } from "../../schema/dataStore"
import { studentDataStoreSchema } from "src/schema/studentSchema"
import { z } from "zod"

type dataStoreKeyResponse = z.infer<typeof studentDataStoreSchema>

const useDataStoreKey = ({ sectionType }: { sectionType: "student" | "staff" }): dataStoreKeyResponse => {
    const dataStoreValues = useRecoilValue(DataStoreState)
    const dataStoreKeyValues = dataStoreValues?.find((dataStore) => dataStore.key === sectionType)

    return dataStoreKeyValues as unknown as dataStoreKeyResponse
}

export default useDataStoreKey