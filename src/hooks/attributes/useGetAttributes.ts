import { ProgramConfig } from "dhis2-semis-components";
import { formatResponseAttributes } from "../../utils/attributes/formatResponseAttributes";

function useGetAttributes({programData}: {programData: ProgramConfig}) {
    const formattedAttributes = formatResponseAttributes(programData) || [];

    return {
        attributes: formattedAttributes,
        unique: formattedAttributes?.filter((attr) => Boolean(attr?.unique)),
        visible: formattedAttributes?.filter((attr) => Boolean(attr?.visible)),
        required: formattedAttributes?.filter((attr) => Boolean(attr?.required)),
        searchable: formattedAttributes?.filter((attr) => Boolean(attr?.searchable)),
    }
}

export { useGetAttributes }