const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Load the real ESM engine, as Vite does, and transpile only our TS adapter.
async function loadAdapter() {
    const engine = await import('@dhis2/rule-engine');
    const source = fs.readFileSync(path.join(__dirname, '../src/hooks/programRules/rules-engine/adapter.ts'), 'utf8');
    const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const exports = {};
    const Module = require('node:module');
    const compiled = new Module(__filename);
    compiled.exports = exports;
    compiled.require = name => name === '@dhis2/rule-engine' ? engine : require(name);
    compiled._compile(js, __filename);
    return compiled.exports.evaluateProgramRules;
}

const base = { program: 'p', type: 'programStage', variables: [{ id: 'x', valueType: 'NUMBER', visible: true }], values: {}, rules: [], ruleVariables: [] };
const rule = (type, data, condition = 'true', extra = {}) => ({ id: 'r', program: { id: 'p' }, condition,
    programRuleActions: [{ id: 'a', programRuleActionType: type, data, dataElement: { id: 'x' }, ...extra }] });

test('official engine assigns numbers without mutating form inputs', async () => {
    const evaluate = await loadAdapter();
    const values = Object.freeze({ x: 0 });
    const result = evaluate({ ...base, values, rules: [rule('ASSIGN', '2 + 3')] });
    assert.equal(result.updatedVariables[0].value, 5);
    assert.equal(result.updatedValues.x, 5);
    assert.equal(values.x, 0);
});

test('numeric zero and boolean false reach the official variable evaluator', async () => {
    const evaluate = await loadAdapter();
    const metadata = (name, id, valueType) => ({ name, program: { id: 'p' }, programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT', dataElement: { id, valueType } });
    const result = evaluate({ ...base, values: { zero: 0, flag: false },
        ruleVariables: [metadata('zero', 'zero', 'NUMBER'), metadata('flag', 'flag', 'BOOLEAN')],
        rules: [rule('HIDEFIELD', null, '#{zero} == 0 && #{flag} == false')] });
    assert.equal(result.updatedVariables[0].visible, false);
});

test('inactive rules restore base visibility on the next evaluation', async () => {
    const evaluate = await loadAdapter();
    assert.equal(evaluate({ ...base, rules: [rule('HIDEFIELD', null)] }).updatedVariables[0].visible, false);
    assert.equal(evaluate({ ...base, rules: [rule('HIDEFIELD', null, 'false')] }).updatedVariables[0].visible, true);
});

test('quotes and apostrophes are values, not executable expressions', async () => {
    const evaluate = await loadAdapter();
    const result = evaluate({ ...base, values: { name: "O'Brien" },
        ruleVariables: [{ name: 'name', program: { id: 'p' }, programRuleVariableSourceType: 'DATAELEMENT_CURRENT_EVENT', dataElement: { id: 'name', valueType: 'TEXT' } }],
        variables: [{ id: 'x', valueType: 'TEXT' }], rules: [rule('ASSIGN', '#{name}')] });
    assert.equal(result.updatedValues.x, "O'Brien");
});

test('option group hiding uses boolean conditions without the old org-unit special case', async () => {
    const evaluate = await loadAdapter();
    const result = evaluate({ ...base, variables: [{ id: 'x', options: { optionSet: { options: [{ value: 'a' }, { value: 'b' }] } } }],
        optionGroups: [{ id: 'group', options: [{ value: 'a' }] }], rules: [rule('HIDEOPTIONGROUP', null, 'true', { optionGroup: { id: 'group' } })] });
    assert.deepEqual(result.updatedVariables[0].options.optionSet.options, [{ value: 'b' }]);
});

test('event date stays distinct from enrollment date', async () => {
    const evaluate = await loadAdapter();
    const result = evaluate({ ...base, values: { event_date: '2025-03-02', enrollment_date: '2025-01-01' },
        rules: [rule('ASSIGN', 'd2:daysBetween(V{enrollment_date}, V{event_date})')] });
    assert.equal(result.updatedValues.x, 60);
});

test('rules respect the current program stage', async () => {
    const evaluate = await loadAdapter();
    const scoped = { ...rule('HIDEFIELD', null), programStage: { id: 'stage1' } };
    assert.equal(evaluate({ ...base, context: { event: { programStage: 'stage2' } }, rules: [scoped] }).updatedVariables[0].visible, true);
    assert.equal(evaluate({ ...base, context: { event: { programStage: 'stage1' } }, rules: [scoped] }).updatedVariables[0].visible, false);
});

test('TEI attributes evaluate in an enrollment form', async () => {
    const evaluate = await loadAdapter();
    const result = evaluate({ ...base, context: { evaluation: 'enrollment' }, values: { attr: 'yes' },
        ruleVariables: [{ name: 'attr', program: { id: 'p' }, programRuleVariableSourceType: 'TEI_ATTRIBUTE', trackedEntityAttribute: { id: 'attr', valueType: 'TEXT' } }],
        rules: [rule('HIDEFIELD', null, "A{attr} == 'yes'")] });
    assert.equal(result.updatedVariables[0].visible, false);
});

test('newest-event variables use supplied historical events', async () => {
    const evaluate = await loadAdapter();
    const result = evaluate({ ...base, context: { event: { event: 'current', programStage: 'stage2', occurredAt: '2025-03-02' },
        events: [{ event: 'old', programStage: 'stage1', occurredAt: '2025-01-01', dataValues: [{ dataElement: 'past', value: '7' }] }] },
        ruleVariables: [{ name: 'past', program: { id: 'p' }, programRuleVariableSourceType: 'DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE', programStage: { id: 'stage1' }, dataElement: { id: 'past', valueType: 'NUMBER' } }],
        rules: [rule('ASSIGN', '#{past} + 1')] });
    assert.equal(result.updatedValues.x, 8);
});

test('calculated variables and rule priorities are handled by the engine', async () => {
    const evaluate = await loadAdapter();
    const calculated = { ...rule('ASSIGN', '3', 'true', { dataElement: undefined, content: '#{calculated}' }), id: 'first', priority: 1 };
    const result = evaluate({ ...base, ruleVariables: [{ name: 'calculated', program: { id: 'p' }, programRuleVariableSourceType: 'CALCULATED_VALUE' }],
        rules: [{ ...rule('ASSIGN', '#{calculated} + 2'), priority: 2 }, calculated] });
    assert.equal(result.updatedValues.x, 5);
});

test('multiple option groups are combined and warning and mandatory effects coexist', async () => {
    const evaluate = await loadAdapter();
    const rules = [rule('SHOWOPTIONGROUP', null, 'true', { optionGroup: { id: 'a' } }), rule('SHOWOPTIONGROUP', null, 'true', { optionGroup: { id: 'b' } }),
        rule('SHOWWARNING', null, 'true', { content: 'Check this value' }), rule('SETMANDATORYFIELD', null)];
    const result = evaluate({ ...base, variables: [{ id: 'x', options: { optionSet: { options: [{ value: 'a' }, { value: 'b' }, { value: 'c' }] } } }],
        rules: rules.map((r, i) => ({ ...r, id: String(i) })), optionGroups: [{ id: 'a', options: [{ value: 'a' }] }, { id: 'b', options: [{ value: 'b' }] }] });
    assert.equal(result.updatedVariables[0].required, true);
    assert.equal(result.updatedVariables[0].warning, true);
    assert.deepEqual(result.updatedVariables[0].options.optionSet.options, [{ value: 'a' }, { value: 'b' }]);
});

test('HIDESECTION hides the section and its fields without mutating metadata', async () => {
    const evaluate = await loadAdapter();
    const variables = [{ id: 'section', fields: [{ id: 'x', visible: true }] }];
    const result = evaluate({ ...base, type: 'programStageSection', variables,
        rules: [rule('HIDESECTION', null, 'true', { dataElement: undefined, programStageSection: { id: 'section' } })] });
    assert.equal(result.updatedVariables[0].visible, false);
    assert.equal(result.updatedVariables[0].fields[0].visible, false);
    assert.equal(variables[0].fields[0].visible, true);
});

test('organisation-unit group membership is resolved by the official d2 function', async () => {
    const evaluate = await loadAdapter();
    const input = { ...base, values: { orgUnit: 'school' }, orgUnitGroups: [{ id: 'group', value: 'CODE', organisationUnits: [{ value: 'school' }] }],
        rules: [rule('HIDEFIELD', null, "d2:inOrgUnitGroup('CODE')")] };
    assert.equal(evaluate(input).updatedVariables[0].visible, false);
    assert.equal(evaluate({ ...input, values: { orgUnit: 'other' } }).updatedVariables[0].visible, true);
});

for (const type of [undefined, 'programStage', 'programStageSection', 'attributesSection']) {
    const assignment = rule('ASSIGN', '5', 'true', type === 'attributesSection'
        ? { dataElement: undefined, trackedEntityAttribute: { id: 'x' } } : {});
    test(`flat variables receive rules regardless of legacy type: ${type}`, async () => {
        const evaluate = await loadAdapter();
        const result = evaluate({ ...base, type, rules: [assignment] });
        assert.equal(result.updatedVariables[0].value, 5);
        assert.equal(result.updatedValues.x, 5);
    });
    for (const key of ['fields', 'variable', 'variables']) {
        test(`sections in ${key} receive rules regardless of legacy type: ${type}`, async () => {
            const evaluate = await loadAdapter();
            const variables = [{ id: 's', label: 'Section', [key]: [{ id: 'x', valueType: 'NUMBER' }] }];
            const result = evaluate({ ...base, type, variables, rules: [assignment] });
            assert.equal(result.updatedVariables[0][key][0].value, 5);
            assert.equal(result.updatedVariables[0].label, 'Section');
            assert.equal(variables[0][key][0].value, undefined);
        });
    }
}

test('mixed fields, nested sections and empty sections preserve layout', async () => {
    const evaluate = await loadAdapter();
    const variables = [{ id: 'empty', fields: [] }, { id: 'x', valueType: 'NUMBER' },
        { id: 'outer', fields: [{ id: 'inner', variable: [{ id: 'x', valueType: 'NUMBER' }] }] }];
    const result = evaluate({ ...base, variables, rules: [rule('ASSIGN', '5'),
        { ...rule('HIDESECTION', null, 'true', { dataElement: undefined, programStageSection: { id: 'outer' } }), id: 'hide' }] });
    assert.deepEqual(result.updatedVariables[0], variables[0]);
    assert.equal(result.updatedVariables[1].value, 5);
    assert.equal(result.updatedVariables[1].visible, undefined);
    assert.equal(result.updatedVariables[2].fields[0].variable[0].value, 5);
    assert.equal(result.updatedVariables[2].fields[0].variable[0].visible, false);
    assert.deepEqual(evaluate({ ...base, variables: [] }).updatedVariables, []);
});
