import { type ProgramConfig } from "../../types/programConfig/ProgramConfig";

export function getMetaData(programConfig: ProgramConfig, stagesId: string[]) {
    let metaDataArray: any = [
        { programId: programConfig.id, programName: programConfig.displayName, id: "ref", name: "Ref", valueType: "TEXT" },
        { id: "orgUnitName", name: "School", valueType: "TEXT" },
        { id: "orgUnit", name: "School UID", valueType: "TEXT" },
    ]

    programConfig.programTrackedEntityAttributes.map((att) => {
        const options = att?.trackedEntityAttribute?.optionSet?.options?.map(option => option.label).join(' | ') ?? ""
        metaDataArray.push({ id: att?.trackedEntityAttribute.id, name: att?.trackedEntityAttribute.displayName, valueType: att?.trackedEntityAttribute.valueType, options: options })
    })

    for (const stageId of stagesId) {
        const currStage = programConfig?.programStages?.find(x => x.id == stageId)

        currStage?.programStageDataElements.map((de) => {
            const options = de?.dataElement?.optionSet?.options?.map(option => option.label).join(' | ') ?? ""
            metaDataArray.push({ id: de.dataElement.id, name: de.dataElement.displayName, valueType: de.dataElement.valueType, options: options })
        })
    }

    return metaDataArray
}