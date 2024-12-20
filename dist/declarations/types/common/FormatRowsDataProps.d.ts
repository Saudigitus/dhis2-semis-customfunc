import { DataValuesProps } from "../api/WithoutRegistrationTypes";
import { attributesProps } from "../api/WithRegistrationTypes";
interface FormatResponseRowsProps {
    eventsInstances: {
        trackedEntity: string;
        dataValues: DataValuesProps[];
        enrollment: string;
        event?: string;
        occurredAt?: string;
        isRegistrationEvent?: boolean;
    }[];
    teiInstances: {
        trackedEntity: string;
        attributes: attributesProps[];
        enrollments: {
            enrollment: string;
            orgUnit: string;
            program: string;
            status: string;
        }[];
        createdAt: string;
        programOwners: {
            orgUnit: string;
        }[];
    }[];
    socioEconInstances?: {
        trackedEntity: string;
        dataValues: DataValuesProps[];
        enrollment: string;
        event?: string;
        occurredAt?: string;
        isRegistrationEvent?: boolean;
    }[];
}
type RowsDataProps = Record<string, string | number | boolean | any>;
export type { FormatResponseRowsProps, RowsDataProps };
