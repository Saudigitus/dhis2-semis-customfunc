import { OptionsProps } from "dhis2-semis-components"

interface programStageDataElements {
    displayInReports: boolean
    compulsory: boolean
    dataElement: {
        displayInReports: boolean | undefined
        displayName: string
        formName: string
        id: string
        valueType: string
        optionSet: {
            id: string
            options: OptionsProps[]
        }
    }
}
interface ProgramStageConfig {
    autoGenerateEvent: boolean
    displayName: string
    id: string
    executionDateLabel?: string
    programStageDataElements: programStageDataElements[]
}

export type { ProgramStageConfig, programStageDataElements }