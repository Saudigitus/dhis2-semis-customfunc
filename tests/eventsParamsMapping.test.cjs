const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Transpile the TS sources (and the TS files they import) to CommonJS, as Vite would bundle them.
require.extensions['.ts'] = (module, file) => {
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    module._compile(js, file);
};

const { convertEventQueryProps } = require(path.join(__dirname, '../src/utils/tracker-migration/eventsParamsMapping.ts'));
const query = { program: 'p', orgUnitMode: 'DESCENDANTS', paging: false, enrollmentStatus: 'ACTIVE', trackedEntities: 'teA' };

for (const version of ['2.41.4.2', '2.41.0', '2.42.3', '2.43.1']) {
    test(`${version} receives orgUnitMode and paging, and programStatus that 2.41.4.2 needs (SEMIS-198)`, () => {
        assert.deepEqual(convertEventQueryProps({ queryProps: query, apiVersion: version }),
            { program: 'p', orgUnitMode: 'DESCENDANTS', paging: false, programStatus: 'ACTIVE', trackedEntity: 'teA' });
    });
}

test('2.40 keeps the old parameter names (SEMIS-198)', () => {
    assert.deepEqual(convertEventQueryProps({ queryProps: query, apiVersion: '2.40.5' }),
        { program: 'p', ouMode: 'DESCENDANTS', skipPaging: true, programStatus: 'ACTIVE', trackedEntity: 'teA' });
});

test('before the version is known, the new names are sent (SEMIS-198)', () => {
    assert.equal(convertEventQueryProps({ queryProps: { paging: false }, apiVersion: '' }).paging, false);
});
