var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useState } from 'react';
import { useGetTei } from '../tei/useGetTei';
import { useGetEvents } from '../events/useGetEvents';
import { attributes, dataValues } from '../../utils/format/formatData';
import { modules } from '../../types/common/moduleTypes';
import { format } from 'date-fns';
export function useGetEnrollmentData(props) {
    const { getTei } = useGetTei();
    const { getEvents } = useGetEvents();
    const [error, setError] = useState(false);
    const { orgUnitName, orgUnit, eventFilters, withSocioEconomics, seletedSectionDataStore, module } = props;
    const getEnrollmentDetails = (events) => __awaiter(this, void 0, void 0, function* () {
        const trackedEntityIds = events === null || events === void 0 ? void 0 : events.map((x) => x.trackedEntity).join(';');
        try {
            return getTei(seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.program, trackedEntityIds)
                .then((trackedEntityInstance) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                let rows = [];
                let counter = 0;
                for (const tei of (_a = trackedEntityInstance === null || trackedEntityInstance === void 0 ? void 0 : trackedEntityInstance.results) === null || _a === void 0 ? void 0 : _a.instances) {
                    counter++;
                    let enrollment = (_b = events.find((x) => x.trackedEntity == (tei === null || tei === void 0 ? void 0 : tei.trackedEntity))) === null || _b === void 0 ? void 0 : _b.enrollment;
                    let socioEconomiscData = [];
                    const registrationData = yield getEvents({
                        program: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.program,
                        programStage: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.registration.programStage,
                        ouMode: "SELECTED",
                        fields: "*",
                        filter: eventFilters,
                        skipPaging: true,
                        trackedEntity: tei.trackedEntity,
                        orgUnit: orgUnit
                    });
                    if (withSocioEconomics || module === modules.enrollment) {
                        socioEconomiscData = yield getEvents({
                            program: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.program,
                            programStage: seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore['socio-economics'].programStage,
                            ouMode: "SELECTED",
                            fields: "*",
                            filter: eventFilters,
                            skipPaging: true,
                            trackedEntity: tei.trackedEntity,
                            orgUnit: orgUnit
                        });
                    }
                    const currEnrollmentRegistration = registrationData === null || registrationData === void 0 ? void 0 : registrationData.find((x) => x.enrollment === enrollment);
                    const currEnrollmentSocioEconomics = socioEconomiscData === null || socioEconomiscData === void 0 ? void 0 : socioEconomiscData.find((x) => x.enrollment === enrollment);
                    rows = [...rows, Object.assign(Object.assign(Object.assign({ ref: "" + counter + " ", school: orgUnitName, orgUnit: currEnrollmentRegistration === null || currEnrollmentRegistration === void 0 ? void 0 : currEnrollmentRegistration.orgUnit, enrollmentDate: format(new Date(currEnrollmentRegistration === null || currEnrollmentRegistration === void 0 ? void 0 : currEnrollmentRegistration.occurredAt), 'yyyy-MM-dd'), enrollment: enrollment, trackedEntity: tei.trackedEntity }, attributes((_c = tei === null || tei === void 0 ? void 0 : tei.attributes) !== null && _c !== void 0 ? _c : [])), dataValues((_d = currEnrollmentRegistration === null || currEnrollmentRegistration === void 0 ? void 0 : currEnrollmentRegistration.dataValues) !== null && _d !== void 0 ? _d : [], seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore.registration.programStage)), dataValues((_e = currEnrollmentSocioEconomics === null || currEnrollmentSocioEconomics === void 0 ? void 0 : currEnrollmentSocioEconomics.dataValues) !== null && _e !== void 0 ? _e : [], seletedSectionDataStore === null || seletedSectionDataStore === void 0 ? void 0 : seletedSectionDataStore['socio-economics'].programStage))];
                }
                return rows;
            }));
        }
        catch (error) {
            setError(error);
        }
    });
    return { getEnrollmentDetails, error };
}
