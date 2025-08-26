import { ProgramConfig, selectedDataStoreKey } from "dhis2-semis-types"
import { Modules } from "dhis2-semis-types"

type BuildFormType = {
    dataStoreData: selectedDataStoreKey
    programData: ProgramConfig
    module: Modules
}

export { type BuildFormType }