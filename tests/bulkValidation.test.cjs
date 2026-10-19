const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

// Transpile the TS validator (and its relative imports) to CommonJS, as Vite would bundle it.
function loadTs(file) {
    const source = fs.readFileSync(file, 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const compiled = new Module(file);
    compiled.filename = file;
    compiled.paths = Module._nodeModulePaths(path.dirname(file));
    compiled.require = name => name.startsWith('.')
        ? loadTs(path.join(path.dirname(file), `${name}.ts`))
        : require(require.resolve(name, { paths: compiled.paths }));
    compiled._compile(js, file);
    return compiled.exports;
}

const { madatoryFieldsValidator } = loadTs(path.join(__dirname, '../src/utils/bulk/validateMandatoryFields.ts'));

const PROFILE = 'Student profile';
const program = {
    programTrackedEntityAttributes: [
        { mandatory: true, displayName: 'Surname', trackedEntityAttribute: { id: 'surname', displayName: 'Surname', valueType: 'TEXT' } },
        { mandatory: false, trackedEntityAttribute: { id: 'sysId', displayName: 'System ID', valueType: 'TEXT', unique: true } },
    ],
    programStages: [
        { id: 'reg', name: 'Registration', programStageDataElements: [{ compulsory: true, dataElement: { id: 'grade', displayName: 'Grade', valueType: 'TEXT' } }] },
        { id: 'fr', name: 'Final result', programStageDataElements: [{ compulsory: false, dataElement: { id: 'decision', displayName: 'Final decision', valueType: 'TEXT' } }] },
        { id: 'att', name: 'Attendance', programStageDataElements: [] },
    ],
};
const dataStore = {
    registration: { programStage: 'reg' },
    'final-result': { programStage: 'fr' },
    attendance: { programStage: 'att', statusOptions: [{ code: 'present' }, { code: 'absent' }], attendanceStatus: { allowAttendanceStatus: false } },
    performance: { programStages: [] },
};

const row = (profile, sections = {}) => ({ [PROFILE]: profile, Ids: { trackedEntity: 't1' }, ...sections });
const validate = (rows, module, store = dataStore) => madatoryFieldsValidator(program, rows, module, PROFILE, store);

test('enrollment rows are checked without the attendance check (SEMIS-207)', () => {
    const valid = row({ surname: 'Doe', sysId: 'A1' }, { Registration: { 'reg.grade': 'G1' } });
    const missingSurname = row({ surname: '' }, { Registration: { 'reg.grade': 'G1' } });

    const result = validate([valid, missingSurname], 'enrollment');

    assert.equal(result.validData.length, 1);
    assert.deepEqual(result.validData[0].warnings, []);
    assert.equal(result.invalidData.length, 1);
    assert.deepEqual(result.invalidData[0].errors, [{ key: 'Surname', error: 'Empty required field' }]);
    assert.deepEqual(result.uniqueAttributes.map(a => a.trackedEntityAttribute.id), ['sysId']);
});

test('final-result rows reach the summary, empty decision stays a warning-free valid row', () => {
    const decided = row({ surname: 'Doe' }, { 'Final result': { 'fr.decision': 'Promoted' } });
    const empty = row({ surname: 'Roe' }, { 'Final result': { 'fr.decision': '' } });

    const result = validate([decided, empty], 'final-result');

    assert.equal(result.validData.length, 2);
    assert.equal(result.invalidData.length, 0);
});

test('a missing attendance configuration does not break the other modules', () => {
    const { attendance, ...storeWithoutAttendance } = dataStore;
    const result = validate([row({ surname: 'Doe' }, { 'Final result': { 'fr.decision': 'Promoted' } })], 'final-result', storeWithoutAttendance);

    assert.equal(result.validData.length, 1);
    assert.equal(result.invalidData.length, 0);
});

test('no "No attendance to this date" error outside the attendance module', () => {
    const result = validate([row({ surname: '' }, { 'Final result': { 'fr.decision': 'Promoted' } })], 'final-result');

    assert.equal(result.invalidData.length, 1);
    assert.ok(result.invalidData[0].errors.every(e => e.error !== 'No attendance to this date'));
});

test('attendance behaviour is unchanged: filled days are warnings, empty days are errors', () => {
    const mixed = row({ surname: 'Doe' }, { Attendance: { '2025-10-01': 'absent', '2025-10-02': '' } });
    const allEmpty = row({ surname: 'Roe' }, { Attendance: { '2025-10-01': '', '2025-10-02': null } });

    const result = validate([mixed, allEmpty], 'attendance');

    assert.equal(result.validData.length, 1);
    assert.deepEqual(result.validData[0].warnings, [{ key: '2025-10-01', error: 'absent' }]);
    assert.equal(result.invalidData.length, 2);
    assert.deepEqual(result.invalidData[0].errors, [{ key: '2025-10-02', error: 'No attendance to this date' }]);
    assert.deepEqual(result.invalidData[1].errors.map(e => e.key), ['2025-10-01', '2025-10-02']);
});

test('attendance with the class attendance status enabled accepts any filled day', () => {
    const store = { ...dataStore, attendance: { ...dataStore.attendance, attendanceStatus: { allowAttendanceStatus: true } } };
    const result = validate([row({ surname: 'Doe' }, { Attendance: { '2025-10-01': 'holiday' } })], 'attendance', store);

    assert.equal(result.validData.length, 1);
    assert.equal(result.invalidData.length, 0);
});
