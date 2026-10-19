const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

// Transpile the TS helpers to CommonJS, as Vite would bundle them.
function loadTs(file) {
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const compiled = new Module(file);
    compiled.filename = file;
    compiled.paths = Module._nodeModulePaths(path.dirname(file));
    compiled._compile(js, file);
    return compiled.exports;
}

const { fieldsOfModule, validateFieldValues, validateEnrollmentDate, otherClassWarnings } = loadTs(path.join(__dirname, '../src/utils/bulk/valueChecks.ts'));
const { splitRowsByRepeatedValues } = loadTs(path.join(__dirname, '../src/utils/bulk/uniqueValues.ts'));

const PROFILE = 'Student profile';
const dataStore = { registration: { programStage: 'reg' }, 'socio-economics': { programStage: 'socio' }, 'final-result': { programStage: 'fr' }, performance: { programStages: [{ programStage: 't1' }] } };
const program = {
    programTrackedEntityAttributes: [
        { trackedEntityAttribute: { id: 'gender', displayName: 'Gender', valueType: 'TEXT', optionSet: { options: [{ value: 'female', label: 'Female' }, { value: 'male', label: 'Male' }] } } },
        { trackedEntityAttribute: { id: 'sysId', displayName: 'System ID', valueType: 'TEXT', unique: true } },
    ],
    programStages: [
        { id: 'reg', displayName: 'Enrollment details', programStageDataElements: [
            { dataElement: { id: 'year', displayName: 'Academic Year', valueType: 'TEXT', optionSet: { options: [{ value: '2025', label: '2025' }, { value: '2024', label: '2024' }] } } },
            { dataElement: { id: 'grade', displayName: 'Grade', valueType: 'TEXT' } },
            { dataElement: { id: 'ecce', displayName: 'Attended ECCE', valueType: 'BOOLEAN' } }] },
        { id: 'socio', displayName: 'Socio-economics', programStageDataElements: [
            { dataElement: { id: 'age', displayName: 'Age', valueType: 'INTEGER_ZERO_OR_POSITIVE' } },
            { dataElement: { id: 'mail', displayName: 'Email', valueType: 'EMAIL' } }] },
        { id: 't1', displayName: 'Term 1', programStageDataElements: [{ dataElement: { id: 'math', displayName: 'Math', valueType: 'PERCENTAGE' } }] },
    ],
};
const row = (profile = {}, reg = {}, socio = {}) => ({ [PROFILE]: profile, 'Enrollment details': { enrollmentDate: '2025-10-01', ...reg }, 'Socio-economics': socio, Ids: {} });

test('a value outside the option list is invalid; option codes are valid', () => {
    const fields = fieldsOfModule(program, 'enrollment', dataStore);
    assert.deepEqual(validateFieldValues(row({ gender: 'F' }), fields), [{ key: 'Gender', error: '"F" is not a valid option' }]);
    assert.deepEqual(validateFieldValues(row({ gender: 'female' }, { 'reg.year': '2025' }), fields), []);
});

test('values that do not match the value type are invalid (number, boolean, email); empty values are not checked here', () => {
    const fields = fieldsOfModule(program, 'enrollment', dataStore);
    const errors = validateFieldValues(row({}, { 'reg.ecce': 'maybe' }, { 'socio.age': 'abc', 'socio.mail': 'x@' }), fields);
    assert.deepEqual(errors.map(e => e.key), ['Enrollment details - Attended ECCE', 'Socio-economics - Age', 'Socio-economics - Email']);
    assert.deepEqual(validateFieldValues(row({}, { 'reg.ecce': 'TRUE' }, { 'socio.age': '12', 'socio.mail': 'a@b.org' }), fields), []);
    assert.deepEqual(validateFieldValues(row({}, {}, { 'socio.age': '-1' }), fields).map(e => e.key), ['Socio-economics - Age']);
    assert.deepEqual(validateFieldValues(row({}, { 'reg.ecce': '' }, { 'socio.age': '' }), fields), []);
});

test('each module checks only the values it sends', () => {
    assert.deepEqual(Object.keys(fieldsOfModule(program, 'performance', dataStore)), ['t1.math']);
    assert.deepEqual(Object.keys(fieldsOfModule(program, 'final-result', dataStore)), []);
    assert.deepEqual(Object.keys(fieldsOfModule(program, 'attendance', dataStore)), []);
    const perf = fieldsOfModule(program, 'performance', dataStore);
    assert.deepEqual(validateFieldValues({ 'Term 1': { 't1.math': '120' }, 'Enrollment details': { 'reg.year': 'old-code' } }, perf).map(e => e.key), ['Term 1 - Math']);
});

test('the enrollment date is mandatory in enrollment files only', () => {
    assert.deepEqual(validateEnrollmentDate(row({}, { enrollmentDate: '' }), 'enrollment', PROFILE), [{ key: 'Enrollment details - Enrollment date', error: 'Empty required field' }]);
    assert.deepEqual(validateEnrollmentDate(row(), 'enrollment', PROFILE), []);
    assert.deepEqual(validateEnrollmentDate(row({}, { enrollmentDate: '' }), 'performance', PROFILE), []);
});

test('a row of another academic year / grade gets a warning; a row of the selected class does not', () => {
    const selected = [{ dataElement: 'year', value: '2025' }, { dataElement: 'grade', value: 'Grade 1' }];
    assert.deepEqual(otherClassWarnings(row({}, { 'reg.year': '2025', 'reg.grade': 'Grade 1' }), 'reg', selected, program), []);
    const warnings = otherClassWarnings(row({}, { 'reg.year': '2024', 'reg.grade': 'Grade 2' }), 'reg', selected, program);
    assert.deepEqual(warnings.map(w => w.key), ['Academic Year', 'Grade']);
    assert.match(warnings[0].error, /"2024" is not the selected one \("2025"\)/);
});

test('a unique value repeated in the file makes all its rows invalid', () => {
    const unique = [{ trackedEntityAttribute: { id: 'sysId' } }];
    const rows = [row({ sysId: 'S-1' }), row({ sysId: ' s-1 ' }), row({ sysId: 'S-2' }), row({ sysId: '' })];
    const { valid, invalid } = splitRowsByRepeatedValues(rows, unique, PROFILE, 'Student');
    assert.equal(invalid.length, 2);
    assert.deepEqual(invalid[0].errors, [{ key: 'Student', error: 'repeated in the file' }]);
    assert.deepEqual(valid.map(r => r[PROFILE].sysId), ['S-2', '']);
});
