import { ProgramConfig } from "src/types/programConfig/ProgramConfig";
import { formatResponseAttributes } from "src/utils/attributes/formatResponseAttributes";

function useGetAttributes(programConfigState: ProgramConfig) {
    const formattedAttributes = formatResponseAttributes(programConfigState) || [];

    return {
        attributes: formattedAttributes,
        unique: formattedAttributes?.filter((attr) => Boolean(attr?.unique)),
        visible: formattedAttributes?.filter((attr) => Boolean(attr?.visible)),
        required: formattedAttributes?.filter((attr) => Boolean(attr?.required)),
        searchable: formattedAttributes?.filter((attr) => Boolean(attr?.searchable)),
    }
}

export { useGetAttributes }