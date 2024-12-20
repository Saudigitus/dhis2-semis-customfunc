var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { format } from "date-fns";
export function generateEventObjects(programStages, data, programConfig) {
    var _a;
    let events = [];
    for (const student of data) {
        const _b = student.Ids, { trackedEntity } = _b, rest = __rest(_b, ["trackedEntity"]);
        for (const programStage of programStages) {
            let eventProperties = { dataValues: [], program: programConfig.id };
            const programStageID = (_a = programConfig.programStages.find(x => x.displayName == programStage)) === null || _a === void 0 ? void 0 : _a.id;
            for (const key of Object.keys(student[programStage])) {
                if (student[programStage][key]) {
                    eventProperties.dataValues.push({
                        dataElement: key.split('.')[1],
                        value: student[programStage][key]
                    });
                }
            }
            events.push(Object.assign(Object.assign(Object.assign({ trackedEntityInstance: trackedEntity }, rest), eventProperties), { programStage: programStageID, occurredAt: format(new Date(), 'yyyy-MM-dd') }));
        }
    }
    return { events };
}
export function generateAttendanceEventObjects(programStages, data, dataStore) {
    let attendanceEvents = [];
    for (const student of data) {
        const _a = student.Ids, { trackedEntity } = _a, rest = __rest(_a, ["trackedEntity"]);
        for (const programStage of programStages) {
            for (const key of Object.keys(student[programStage])) {
                if (student[programStage][key]) {
                    attendanceEvents.push(Object.assign(Object.assign({ occurredAt: key, trackedEntity }, rest), { program: dataStore.program, programStage: dataStore.attendance.programStage, dataValues: [
                            {
                                dataElement: dataStore.attendance.status,
                                value: student[programStage][key]
                            }
                        ] }));
                }
            }
        }
    }
    return { attendanceEvents };
}
export function generateEnrollmentData(profile, programConfig, stagesToIgnore, data, orgUnit, updating) {
    let enrollments = [];
    const programStages = programConfig.programStages.map((x) => {
        if (!stagesToIgnore.includes(x.id))
            return { id: x.id, name: x.displayName };
    }).filter(x => x != undefined);
    for (const student of data) {
        let events = [], att = [], enrollmentDate = null;
        for (const stage of programStages) {
            let dataValues = [];
            if (student[stage.name]) {
                for (const key of Object.keys(student[stage.name])) {
                    if (student[stage.name][key] && key.split('.')[1] || key === 'enrollmentDate') {
                        if (key === 'enrollmentDate') {
                            enrollmentDate = student[stage.name]['enrollmentDate'];
                        }
                        else {
                            dataValues = [
                                ...dataValues,
                                {
                                    dataElement: key.split(".")[1],
                                    value: student[stage.name][key]
                                }
                            ];
                        }
                    }
                }
            }
            events.push(Object.assign({ program: programConfig.id, orgUnit: orgUnit, dataValues: dataValues, status: "ACTIVE", occurredAt: format(new Date(), 'yyyy-MM-dd'), programStage: stage.id }, (updating ? { trackedEntity: student.Ids.trackedEntity } : {})));
        }
        for (const key of Object.keys(student[profile])) {
            if (student[profile][key] && key != 'ref') {
                att = [
                    ...att,
                    {
                        attribute: key,
                        value: student[profile][key]
                    }
                ];
            }
        }
        enrollments.push(Object.assign({ events: events, program: programConfig.id, orgUnit: orgUnit, status: "COMPLETED", attributes: att, occurredAt: format(new Date(), 'yyyy-MM-dd'), enrolledAt: format(new Date(enrollmentDate), 'yyyy-MM-dd') }, (updating ? { enrollment: student.Ids.enrollment } : {})));
    }
    return { enrollments };
}
