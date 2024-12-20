export declare const fieldsType: {
    programStage: string;
    programStageSection: string;
};
interface EventQueryProps {
    page?: number;
    pageSize?: number;
    paging?: boolean;
    ouMode?: string;
    program: string;
    order?: string;
    programStatus?: string;
    programStage: string;
    orgUnit?: string;
    filter?: string[];
    filterAttributes?: string[];
    trackedEntity?: string;
    fields?: string;
}
interface GeTDataElementsProps {
    programStageId: string;
    type?: keyof typeof fieldsType;
}
interface dataValuesProps {
    dataElement: string;
    value: string;
}
interface EventQueryResults {
    results: {
        instances: [
            {
                trackedEntity: string;
                dataValues: dataValuesProps[];
            }
        ];
    };
}
export type { EventQueryProps, GeTDataElementsProps, EventQueryResults, dataValuesProps };
