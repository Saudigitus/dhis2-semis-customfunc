import { useDataQuery } from "@dhis2/app-runtime";

type ProgramIndicator = {
    id: string;
    displayName: string;
    shortName: string;
    code?: string;
    displayDescription?: string;
    displayInForm?: boolean;
    lastUpdated?: string;
    created?: string;
    program?: {
        displayName: string;
    };
    sharing?: any;
    access?: any;
    href?: string;
    level?: number;
};

type UseGetProgramIndicatorsProps = {
    programId: string;
    filter?: string;
    fields?: string;
    order?: string;
    paging?: boolean;
    page?: number;
    pageSize?: number;
};

function buildProgramIndicatorsQuery(props: UseGetProgramIndicatorsProps) {
    const {
        programId,
        filter = "",
        fields = "id,displayName,shortName,code,displayDescription,displayInForm,lastUpdated,created,program[displayName],sharing,access,href",
        order = "displayName:ASC",
        paging = false,
        page,
        pageSize,
    } = props;

    const params: Record<string, any> = {
        filter: [
            `program.id:eq:${programId}`,
            `analyticsType:eq:ENROLLMENT`,
            `name:ne:default`,
            `displayInForm:eq:true`,
        ],
        fields,
        order,
        paging,
    };

    if (filter) {
        params.filter.push(filter);
    }

    if (paging && page !== undefined && pageSize !== undefined) {
        params.page = page;
        params.pageSize = pageSize;
    }

    return {
        results: {
            resource: "programIndicators",
            params,
        },
    };
}

type ProgramIndicatorsQueryResponse = {
    results: {
        programIndicators: ProgramIndicator[];
    };
};

export function useGetProgramIndicators(props: UseGetProgramIndicatorsProps) {
    const query = buildProgramIndicatorsQuery(props);

    const { data, loading, error, refetch } = useDataQuery<ProgramIndicatorsQueryResponse>(query);

    return {
        programIndicators: data?.results?.programIndicators ?? [],
        loading,
        error,
        refetch,
    };
}

export type { ProgramIndicator, UseGetProgramIndicatorsProps };
