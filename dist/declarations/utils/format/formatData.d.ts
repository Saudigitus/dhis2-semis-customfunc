import { DataValuesProps } from "../../types/api/WithoutRegistrationTypes";
import { attributesProps } from "../../types/api/WithRegistrationTypes";
import { RowsDataProps } from "../../types/common/FormatRowsDataProps";
import { type AttendanceFormaterProps } from "../../types/attendance/attendaceFormaterProps";
import { Attendance } from "../../types/dataStore/DataStoreConfig";
export declare function attributes(data: attributesProps[]): RowsDataProps;
export declare function dataValues(data: DataValuesProps[], stageId: string): RowsDataProps;
export declare function attendanceFormater(events: AttendanceFormaterProps[], attendanceConfig: Attendance): RowsDataProps;
