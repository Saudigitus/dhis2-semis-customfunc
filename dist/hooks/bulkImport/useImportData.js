var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { modules } from "../../types/common/moduleTypes";
import { generateAttendanceEventObjects, generateEnrollmentData, generateEventObjects } from "./createEvents/createEventsObject";
import { postAttendanceValues } from "./postEvents/postAttendance";
import { postEnrollmentData } from "./postEvents/postEnrollment";
import { postValues } from "./postEvents/postEvents";
import { useState } from 'react';
export function useImportData() {
    const [stats, setStats] = useState();
    const { postData } = postValues({ setStats });
    const { postAttendance } = postAttendanceValues({ setStats });
    const { postEnrollments } = postEnrollmentData({ setStats });
    function importData(props) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { excelData, importMode, updating = false, programConfig, selectedSectionDataStore, orgUnit, sectionType } = props;
            const studentsData = excelData.mapping;
            const profile = sectionType.substring(0, 1).toUpperCase() + sectionType.substring(1, sectionType.length) + ' profile';
            const programStages = [
                ...(excelData.module != modules.enrollment ?
                    (selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore[excelData.module].programStage) ?
                        [selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore[excelData.module].programStage] :
                        selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore[excelData.module].programStages.map((x) => x.programStage)
                    : [])
            ];
            const displayNames = programConfig.programStages.filter(x => programStages.includes(x.id)).map(x => x.displayName);
            switch (excelData.module) {
                case modules.attendance:
                    const { attendanceEvents } = generateAttendanceEventObjects(displayNames, studentsData, selectedSectionDataStore);
                    const attendanceDisplayName = (_a = programConfig.programStages.find(x => x.id === (selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.attendance.programStage))) === null || _a === void 0 ? void 0 : _a.displayName;
                    yield postAttendance(attendanceEvents, attendanceDisplayName, selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.attendance.programStage, excelData.mapping, programConfig.id, importMode);
                    break;
                case modules.enrollment:
                    /**
                     * Ao se registar um novo estudante criam-se eventos de todos os program stages, excepto attendance e transfer e
                     * ao se actualizar o estudante nao se cria nenhum evento, sendo assim, esse array terá uma lista de todos os
                     * program stages que devem ser ignorados na hora de actualizar e/ou registar um novo estudante
                     */
                    const stagesToIgnore = [
                        selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.attendance.programStage,
                        selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.transfer.programStage,
                        ...(updating ? [
                            selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore["final-result"].programStage,
                            selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.registration.programStage,
                            ...(selectedSectionDataStore === null || selectedSectionDataStore === void 0 ? void 0 : selectedSectionDataStore.performance.programStages.map(x => x.programStage))
                        ] : [""])
                    ];
                    const { enrollments } = generateEnrollmentData(profile, programConfig, stagesToIgnore, studentsData, orgUnit, updating);
                    yield postEnrollments(enrollments, studentsData, importMode, programConfig.id, updating, selectedSectionDataStore, orgUnit);
                    break;
                default:
                    const { events } = generateEventObjects(displayNames, studentsData, programConfig);
                    yield postData(events, excelData, importMode, programConfig, programStages);
                    break;
            }
        });
    }
    return { importData, stats };
}
