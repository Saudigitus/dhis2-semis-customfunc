const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const Module = require('node:module');

// Transpile the TS helpers to CommonJS, as Vite would bundle them.
function loadTs(file) {
    const source = fs.readFileSync(file, 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const compiled = new Module(file);
    compiled.filename = file;
    compiled.paths = Module._nodeModulePaths(path.dirname(file));
    compiled._compile(js, file);
    return compiled.exports;
}

const {
    UNIQUE_VALUES_PER_REQUEST, escapeFilterValue, buildInFilter, buildUniqueValueQueries, existingValueKey, splitRowsByExistingValues
} = loadTs(path.join(__dirname, '../src/utils/bulk/uniqueValues.ts'));

const PROFILE = 'Student profile';
const unique = [{ trackedEntityAttribute: { id: 'sysId' } }, { trackedEntityAttribute: { id: 'intId' } }];
const row = (sysId, intId, orgUnit) => ({ [PROFILE]: { sysId, intId, name: 'x' }, Ids: orgUnit ? { orgUnit } : {} });

test('1,000 rows need 20 requests (100 values per request) instead of 2,000', () => {
    const rows = Array.from({ length: 1000 }, (_, i) => row(`S-${i}`, `I-${i}`));
    const queries = buildUniqueValueQueries(rows, unique, PROFILE, 'school1');

    assert.equal(UNIQUE_VALUES_PER_REQUEST, 100);
    assert.equal(queries.length, 20);
    assert.ok(queries.every(q => q.orgUnit === 'school1' && q.values.length === 100));
    assert.equal(new Set(queries.flatMap(q => q.values.map(v => `${q.attribute}|${v}`))).size, 2000);
});

test('values are grouped by the school of the row; empty and repeated values are not sent', () => {
    const rows = [row('A', '', 'ou1'), row('A', null, 'ou1'), row(' B ', undefined, 'ou2'), row('C')];
    const queries = buildUniqueValueQueries(rows, unique, PROFILE, 'school1');

    assert.deepEqual(queries, [
        { orgUnit: 'ou1', attribute: 'sysId', values: ['A'] },
        { orgUnit: 'ou2', attribute: 'sysId', values: ['B'] },
        { orgUnit: 'school1', attribute: 'sysId', values: ['C'] },
    ]);
});

test('filter values are escaped so that separators inside a value do not break the request', () => {
    assert.equal(escapeFilterValue('a:b;c,d/e'), 'a/:b/;c/,d//e');
    assert.equal(buildInFilter('sysId', ['2026-01', 'x;y']), 'sysId:in:2026-01;x/;y');
});

test('rows with a value found on the server in their school are invalid, the others stay valid', () => {
    const rows = [
        { ...row('S-1', 'I-1', 'ou1'), warnings: [] },
        { ...row('S-2', 'I-2', 'ou1'), warnings: [] },
        { ...row('S-3', 'I-3', 'ou2'), warnings: [] },
    ];
    // S-1 exists in ou1 (other case and spaces), I-3 exists but in another school.
    const existing = new Set([existingValueKey('ou1', 'sysId', ' s-1 '), existingValueKey('ou1', 'intId', 'I-3')]);

    const { valid, invalid } = splitRowsByExistingValues(rows, unique, PROFILE, 'school1', existing, 'Student');

    assert.deepEqual(invalid.map(r => r[PROFILE].sysId), ['S-1']);
    assert.deepEqual(invalid[0].errors, [{ key: 'Student', error: 'already exists in the system' }]);
    assert.deepEqual(invalid[0].warnings, []);
    assert.deepEqual(valid.map(r => r[PROFILE].sysId), ['S-2', 'S-3']);
});

test('with no unique attribute nothing is sent and every row stays valid', () => {
    const rows = [row('S-1', 'I-1')];
    assert.deepEqual(buildUniqueValueQueries(rows, [], PROFILE, 'school1'), []);
    assert.equal(splitRowsByExistingValues(rows, [], PROFILE, 'school1', new Set(), 'Student').valid.length, 1);
});
