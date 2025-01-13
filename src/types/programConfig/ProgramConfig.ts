import { OptionsProps } from "dhis2-semis-components"
import { ProgramStageConfig } from "../programStageConfig/ProgramStageConfig"

interface ProgramConfig {
    displayName: string
    id: string
    description: string
    access?: any
    programType: string
    programStages: ProgramStageConfig[]
    programTrackedEntityAttributes: [
        {
            trackedEntityAttribute: {
                generated: boolean
                pattern?: string
                displayName: string
                id: string
                valueType: string
                unique: boolean
                optionSet: { id: string, options: OptionsProps[] }
            }
            searchable: boolean
            displayInList: boolean
            mandatory: boolean
        }
    ]
    trackedEntityType: {
        trackedEntityTypeAttributes: [
            {
                trackedEntityAttribute: {
                    id: string
                }
            }
        ]
        id: string
    }
}

export type { ProgramConfig }
