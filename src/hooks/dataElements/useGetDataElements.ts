import { useDataQuery } from "@dhis2/app-runtime";
import { DataElementFieldType, GetDataElementsProps } from "src/types/events/eventsProps";
import { formatResponseDataElements } from "src/utils/dataElements/formatResponseDataElements";

const DATA_ELEMENTS_QUERY = (id: string, type: keyof typeof DataElementFieldType) => ({
  result: {
    resource: "programStages",
    id,
    params: {
      fields: DataElementFieldType[type]
    }
  }
});

function useGetDataElements(props: GetDataElementsProps) {
  const { programStageId, type = "programStage" } = props
  const { data, loading, error } = useDataQuery<{ result: any }>(DATA_ELEMENTS_QUERY(programStageId, type));

  return {
    dataElements: formatResponseDataElements(data?.result),
    error,
    loading
  };
}
export { useGetDataElements };
