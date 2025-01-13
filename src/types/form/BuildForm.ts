import { ProgramConfig } from "dhis2-semis-components"
import { DataStoreRecord } from "../dataStore/DataStoreConfig"
import { modules } from "../common/moduleTypes"

type BuildFormType = {
    dataStoreData: DataStoreRecord
    programData: ProgramConfig
    module: modules
}

export { type BuildFormType }