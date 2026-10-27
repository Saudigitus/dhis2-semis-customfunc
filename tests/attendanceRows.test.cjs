const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Transpile the TS sources to CommonJS, as Vite would bundle them.
require.extensions['.tsx'] = (module, file) => {
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React } }).outputText;
    module._compile(js, file);
};

const { attendanceDataValuesFormater } = require(path.join(__dirname, '../src/utils/table/rows/formatRowsData.tsx'));
const config = { status: 'status', absenceReason: 'reason' };
const event = (id, day, values) => ({ event: id, occurredAt: `${day}T00:00:00.000`, dataValues: Object.entries(values).map(([dataElement, value]) => ({ dataElement, value })) });

test('a day without a reason does not show the reason of another day', () => {
    const rows = attendanceDataValuesFormater([
        event('e1', '2026-10-12', { status: 'absent', reason: 'SICK' }),
        event('e2', '2026-10-16', { status: 'absent' }),
    ], config);
    assert.deepEqual(rows['2026-10-12'], { status: 'absent', absenceOption: 'SICK', eventId: 'e1' });
    assert.deepEqual(rows['2026-10-16'], { status: 'absent', absenceOption: undefined, eventId: 'e2' });
});

test('a day without a status does not show the status of another day', () => {
    const rows = attendanceDataValuesFormater([
        event('e1', '2026-10-12', { status: 'absent' }),
        event('e2', '2026-10-13', {}),
    ], config);
    assert.equal(rows['2026-10-13'].status, undefined);
});
