import { type TeiQueryResults } from "../../types/api/WithRegistrationTypes";
export declare function useGetTei(): {
    getTei: (program: string, trackedEntity: string[]) => Promise<TeiQueryResults>;
};
