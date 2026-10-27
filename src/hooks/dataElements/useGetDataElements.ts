import { useEffect, useRef } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { formatResponseDataElements } from "../../utils/dataElements/formatResponseDataElements";
import { DataElementFieldType, GetDataElementsProps } from "../../types/api/WithoutRegistrationTypes";

const DATA_ELEMENTS_QUERY = (type: keyof typeof DataElementFieldType) => ({
  result: {
    resource: "programStages",
    id: ({ id }: Record<string, any>) => id,
    params: {
      fields: DataElementFieldType[type]
    }
  }
});

function useGetDataElements(props: GetDataElementsProps) {
  const { programStageId, type = "programStage" } = props
  const { data, loading, error, refetch } = useDataQuery<{ result: any }>(DATA_ELEMENTS_QUERY(type), {
    variables: { id: programStageId },
    lazy: !programStageId
  });

  // The query keeps the stage of its first render: ask again when the stage changes, e.g. when the
  // same page goes from Staff Re-enroll to the Student final result.
  const lastStage = useRef(programStageId)
  useEffect(() => {
    if (!programStageId || programStageId === lastStage.current) return
    lastStage.current = programStageId
    void refetch({ id: programStageId })
  }, [programStageId])

  return {
    dataElements: formatResponseDataElements(data?.result),
    error,
    loading
  };
}
export { useGetDataElements };
