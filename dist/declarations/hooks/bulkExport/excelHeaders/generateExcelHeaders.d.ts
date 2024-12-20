import { GenerateHeaders } from "../../../types/bulk/bulkOperations";
export declare function generateHeaders(props: GenerateHeaders): {
    getHeaders: () => {
        formatedHeaders: any[];
        filters: {};
        toGenerate: any[];
        defaultLockedHeaders: any;
    };
};
