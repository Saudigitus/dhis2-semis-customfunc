import { useState, useEffect } from 'react'
import { modules } from '../../types/common/moduleTypes';
import { BuildFormType } from 'src/types/form/BuildForm';
import { ProgramStageConfig } from '../../types/programStageConfig/ProgramStageConfig';
import { formatResponseAttributes } from '../../utils/attributes/formatResponseAttributes';
import { formatResponseDataElements } from '../../utils/dataElements/formatResponseDataElements';

export function useBuildForm({dataStoreData, programData, module}: BuildFormType) {
    const [formData, setFormData] = useState<any[]>([])

    const buildForm = () => {
        if (Object.keys(dataStoreData)?.length && programData !== undefined) {
            const { programStages } = programData
            const { registration, 'socio-economics': socioEconomics, "final-result": final_result } = dataStoreData

            switch (module) {
                case modules.enrollment:
                    const registrationProgramStage = programStages?.find((element) => element?.id === registration.programStage) as unknown as ProgramStageConfig
                    const socioEconomicProgramStage = programStages?.find((element) => element?.id === socioEconomics?.programStage) as unknown as ProgramStageConfig

                    setFormData([formatResponseDataElements(registrationProgramStage), formatResponseAttributes(programData), formatResponseDataElements(socioEconomicProgramStage)])
                    break;

                case modules.attendance:

                    setFormData([])
                    break;

                case modules.final_result:
                    const finalResultProgramStage = programStages?.find((element) => element?.id === final_result?.programStage) as unknown as ProgramStageConfig

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