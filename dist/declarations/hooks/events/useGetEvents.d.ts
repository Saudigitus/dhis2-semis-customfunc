import { type EventQueryProps } from "../../types/api/WithoutRegistrationTypes";
export declare function useGetEvents(): {
    getEvents: (props: EventQueryProps) => Promise<any>;
    error: any;
};
