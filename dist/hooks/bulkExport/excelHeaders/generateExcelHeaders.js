import { modules } from "../../../types/common/moduleTypes";
import { generateAttendanceDays } from "../../../utils/attendance/generateAttendanceDays";
import { dfHeaders } from "../../../utils/constants/dfHeaders";
import { getFilterLables } from "../../../utils/format/getFilterLables";
export function generateHeaders(props) {
    const { empty, module, programConfig, stagesToExport, sectionType, seletedSectionDataStore, withSocioEconomics, isSchoolDay, endDate, startDate } = props;
    const { getValidDaysToExport } = generateAttendanceDays({ unavailableDays: isSchoolDay });
    function getHeaders() {
        var _a, _b, _c;
        let formatedHeaders = [], toGenerate = [];
        const Profile = (sectionType !== null && sectionType !== void 0 ? sectionType : '').substring(0, 1).toUpperCase() + (sectionType !== null && sectionType !== void 0 ? sectionType : '').substring(1, (sectionType !== null && sectionType !== void 0 ? sectionType : '').length) + ' profile';
        let defaultLockedHeaders = [Profile, "Ids"], filters = {};
        const stageHeaders = [seletedSectionDataStore.registration.programStage,
            ...((withSocioEconomics || module === modules.enrollment) ? [seletedSectionDataStore["socio-economics"].programStage] : []),
            ...(module != modules.enrollment ? stagesToExport : [])
        ];
        const colors = {
            [seletedSectionDataStore.registration.programStage]: "FCE5CD",
            [seletedSectionDataStore["socio-economics"].programStage]: "FFFFC5"
        };
        for (const stageId of stageHeaders) {
            const currStage = (_a = programConfig === null || programConfig === void 0 ? void 0 : programConfig.programStages) === null || _a === void 0 ? void 0 : _a.find(x => x.id == stageId);
            if (stageId === seletedSectionDataStore.attendance.programStage) {
                let section = {
                    name: currStage === null || currStage === void 0 ? void 0 : currStage.displayName,
                    headers: [
                        ...getValidDaysToExport(new Date(startDate), new Date(endDate)).map((day) => {
                            return {
                                header: day.date,
                                key: day.date,
                                disabled: !day.schoolDay,
                                width: 25,
                            };
                        })
                    ]
                };
                const statusDe = currStage === null || currStage === void 0 ? void 0 : currStage.programStageDataElements.find(x => x.dataElement.id === seletedSectionDataStore.attendance.status);
                filters["Attendance"] = getFilterLables((_b = statusDe === null || statusDe === void 0 ? void 0 : statusDe.dataElement.optionSet.options) !== null && _b !== void 0 ? _b : []);
                formatedHeaders.push(section);
            }
            else {
                let schoolKey = [];
                if ((currStage === null || currStage === void 0 ? void 0 : currStage.id) === seletedSectionDataStore.registration.programStage) {
                    defaultLockedHeaders.push(currStage === null || currStage === void 0 ? void 0 : currStage.displayName);
                    const defaultHeaders = [
                        {
                            header: 'Ref',
                            key: 'ref',
                            width: 15,
                        },
                        {
                            header: 'School',
                            key: 'school',
                            width: 25,
                        },
                        {
                            header: 'Enrollment Date',
                            key: 'enrollmentDate',
                            width: 25,
                        }
                    ];
                    schoolKey = defaultHeaders;
                }
                let section = {
                    name: currStage === null || currStage === void 0 ? void 0 : currStage.displayName,
                    headers: [...schoolKey],
                    fill: colors[currStage === null || currStage === void 0 ? void 0 : currStage.id]
                };
                currStage === null || currStage === void 0 ? void 0 : currStage.programStageDataElements.map((de) => {
                    var _a, _b, _c, _d;
                    if (((_c = (_b = (_a = de === null || de === void 0 ? void 0 : de.dataElement) === null || _a === void 0 ? void 0 : _a.optionSet) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.length) > 0)
                        filters[de.dataElement.id] = getFilterLables(de.dataElement.optionSet.options);
                    section = Object.assign(Object.assign({}, section), { headers: [...section.headers, {
                                header: `${de === null || de === void 0 ? void 0 : de.dataElement.displayName}${de.compulsory && empty ? "*" : ""}`,
                                key: `${stageId}.${(_d = de === null || de === void 0 ? void 0 : de.dataElement) === null || _d === void 0 ? void 0 : _d.id}`,
                                width: (de === null || de === void 0 ? void 0 : de.dataElement.displayName.length) > 25 ? de === null || de === void 0 ? void 0 : de.dataElement.displayName.length : 25,
                            }] });
                });
                if ((currStage === null || currStage === void 0 ? void 0 : currStage.id) === seletedSectionDataStore.registration.programStage)
                    formatedHeaders.unshift(section);
                else
                    formatedHeaders.push(section);
            }
        }
        const att = (_c = programConfig === null || programConfig === void 0 ? void 0 : programConfig.programTrackedEntityAttributes) === null || _c === void 0 ? void 0 : _c.map(x => {
            var _a, _b, _c, _d, _e, _f;
            if (((_c = (_b = (_a = x === null || x === void 0 ? void 0 : x.trackedEntityAttribute) === null || _a === void 0 ? void 0 : _a.optionSet) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.length) > 0)
                filters[x.trackedEntityAttribute.id] = getFilterLables((_e = (_d = x === null || x === void 0 ? void 0 : x.trackedEntityAttribute) === null || _d === void 0 ? void 0 : _d.optionSet) === null || _e === void 0 ? void 0 : _e.options);
            if (x.trackedEntityAttribute.generated || x.trackedEntityAttribute.unique)
                toGenerate.push(x.trackedEntityAttribute.id);
            return {
                header: `${x.trackedEntityAttribute.displayName}${x.mandatory && empty ? "*" : ""}`,
                key: (_f = x.trackedEntityAttribute) === null || _f === void 0 ? void 0 : _f.id,
                width: x.trackedEntityAttribute.displayName.length > 25 ? x.trackedEntityAttribute.displayName : 25,
            };
        });
        formatedHeaders.splice(1, 0, {
            name: Profile, headers: [...(att || [])], fill: 'D9EAD3'
        });
        if (!empty)
            formatedHeaders.push({
                name: "Ids",
                headers: dfHeaders
            });
        return { formatedHeaders, filters, toGenerate, defaultLockedHeaders };
    }
    return { getHeaders };
}
