import { useRecoilValue } from "recoil"
import { DataStoreState } from "../../schema/dataStore"
import {type selectedDataStoreKey } from 'dhis2-semis-types'

const useDataStoreKey = ({ sectionType }: { sectionType: "student" | "staff" }): selectedDataStoreKey => {
    const dataStoreValues = useRecoilValue(DataStoreState)
    const dataStoreKeyValues = dataStoreValues?.find((dataStore) => dataStore.key === sectionType)

    return dataStoreKeyValues as unknown as selectedDataStoreKey
}

export default useDataStoreKey