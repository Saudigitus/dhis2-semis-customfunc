var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useGetEnrollmentData } from "../../enrollmentDetails/useGetEnrollmentDetails";
import { useGetEvents } from "../../events/useGetEvents";
export function getCommonSheetData(props) {
    const { getEvents } = useGetEvents();
    const { orgUnit, eventFilters = [], seletedSectionDataStore } = props;
    const { getEnrollmentDetails } = useGetEnrollmentData(Object.assign({}, props));
    function getData() {
        return __awaiter(this, void 0, void 0, function* () {
            const events = yield getEvents({
                program: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.program,
                programStage: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.registration.programStage,
                fields: "trackedEntity,enrollment,orgUnit,program",
                filter: eventFilters,
                orgUnit,
                skipPaging: true,
                ouMode: 'SELECTED',
                order: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.defaults.defaultOrder
            });
            const enrollmentDetails = yield getEnrollmentDetails(events);
            return enrollmentDetails;
        });
    }
    return { getData };
}
