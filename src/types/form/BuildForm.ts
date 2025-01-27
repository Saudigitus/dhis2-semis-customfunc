import { ProgramConfig, selectedDataStoreKey } from "dhis2-semis-types"
import { modules } from "../common/moduleTypes"

type BuildFormType = {
    dataStoreData: selectedDataStoreKey
    programData: ProgramConfig
    module: modules
}

export { type BuildFormType }