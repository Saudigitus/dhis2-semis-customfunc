export declare const fieldsType: {
    programStage: string;
    programStageSection: string;
};
interface EventQueryProps {
    page?: number;
    pageSize?: number;
    ouMode?: string;
    program: string;
    order?: string;
    programStage?: string;
    orgUnit?: string;
    filter?: string[];
    filterAttributes?: string[];
    trackedEntity?: string;
    occurredAfter?: string;
    occurredBefore?: string;
    fields?: string;
    skipPaging?: boolean;
}
interface GeTDataElementsProps {
    programStageId: string;
    type?: keyof typeof fieldsType;
}
interface DataValuesProps {
    dataElement: string;
    value: string;
}
interface EventQueryResults {
    results: {
        instances: [
            {
                trackedEntity: string;
                dataValues: DataValuesProps[];
            }
        ];
    };
}
interface TransferQueryResults {
    results: {
        instances: [
            {
                trackedEntity: string;
                orgUnit: string;
                dataValues: DataValuesProps[];
            }
        ];
    };
}
interface AttendanceQueryResults {
    results: {
        instances: any;
    };
}
interface CreateEventProps {
    teiDetails: any;
    dataElementId: string;
    dataElementValue: string;
    typeField: string;
    rowsData: any[];
    setTableData: any;
    setselectedTerm: any;
}
export type { EventQueryProps, GeTDataElementsProps, EventQueryResults, DataValuesProps, TransferQueryResults, AttendanceQueryResults, CreateEventProps };
