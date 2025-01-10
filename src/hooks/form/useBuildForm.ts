import { useState, useEffect } from 'react'
import { modules } from 'src/types/common/moduleTypes';
import { ProgramConfig } from 'src/types/programConfig/ProgramConfig';
import { DataStoreRecord } from 'src/types/dataStore/DataStoreConfig';
import { ProgramStageConfig } from '../../types/programStageConfig/ProgramStageConfig';
import { formatResponseAttributes, formatResponseDataElements } from 'src/utils/form';

export function useBuildForm(getDataStoreData: DataStoreRecord, getProgram: ProgramConfig, module: modules) {
    const [formData, setFormData] = useState<any[]>([])

    const buildForm = () => {
        if (Object.keys(getDataStoreData)?.length && getProgram !== undefined) {
            const { programStages } = getProgram
            const { registration, 'socio-economics': socioEconomics, "final-result": final_result } = getDataStoreData

            switch (module) {
                case modules.enrollment:
                    const registrationProgramStage = programStages.find((element: ProgramStageConfig) => element.id === registration.programStage) as unknown as ProgramStageConfig
                    const socioEconomicProgramStage = programStages.find((element: ProgramStageConfig) => element.id === socioEconomics?.programStage) as unknown as ProgramStageConfig

                    setFormData([formatResponseDataElements(registrationProgramStage), formatResponseAttributes(getProgram), formatResponseDataElements(socioEconomicProgramStage)])
                    break;

                case modules.attendance:

                    setFormData([])
                    break;

                case modules.final_result:
                    const finalResultProgramStage = programStages.find((element: ProgramStageConfig) => element.id === final_result?.programStage) as unknown as ProgramStageConfig

                    setFormData([formatResponseDataElements(finalResultProgramStage)])
                    break;

                case modules.performance:

                    setFormData([])
                    break;

                case modules.transfer:

                    setFormData([])
                    break;
            }
        }
    }

    useEffect(() => {
        buildForm()
    }, [])

    return { formData }
}