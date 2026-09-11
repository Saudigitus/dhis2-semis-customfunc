# DHIS2 program rules

SEMIS evaluates expressions using `@dhis2/rule-engine` 3.8.2, the shared engine
also used by Capture. There is no custom JavaScript expression evaluator.

Reference integration: https://github.com/dhis2/capture-app/tree/master/src/core_modules/capture-core/rules/RuleEngine

`RulesEngineWrapper` loads fresh rules, variables, option groups, organisation
unit groups, constants and current user roles/groups before mounting forms.
Rules retain priorities, stage restrictions and variable source types. The old
IndexedDB rules cache is deliberately bypassed because its metadata is incomplete
and it is not scoped to a server/program set.

`RulesEngine({ program, type, variables, values, context })` preserves the
existing `runRulesEngine` / `updatedVariables` API. It also returns
`updatedValues`, raw `effects`, and `error`. An explicit empty override is valid.
Inputs are never mutated. Always pass original field definitions, not previously
evaluated output, so inactive rules restore the original field state.

Form layout is detected automatically: a plain array is evaluated as fields;
items containing `fields`, `variable`, or `variables` arrays are evaluated as
sections. Mixed lists and nested sections preserve their original structure,
including empty sections. This applies both to field metadata lookup and effect
application. The optional legacy `type` does not determine the layout;
`attributesSection` retains its enrollment-evaluation default. Prefer
`context.evaluation` to choose event versus enrollment evaluation explicitly.

The optional context accepts `event`, `enrollment`, `events`, `constants`,
`userRoles`, `userGroups`, and `evaluation: 'event' | 'enrollment'`.
Event data accepts `event`, `programStage`, `occurredAt`, `scheduledAt`,
`createdAt`, `status`, `orgUnit`, and DHIS2 `dataValues`.
Enrollment data accepts `enrollment`, `enrolledAt`, `incident_date`,
`enrollmentStatus`, `orgUnit`, and attribute values keyed by attribute ID.
Provide historical events for PREVIOUS/NEWEST event variables: the engine does
not fetch individual tracker records. No enrollment date is substituted for a
missing event date. Pass the selected stage explicitly for stage-specific rules.

The field adapter handles ASSIGN, HIDEFIELD, SHOWERROR, SHOWWARNING,
SETMANDATORYFIELD, HIDEOPTION, SHOWOPTIONGROUP, HIDEOPTIONGROUP and HIDESECTION.
Other effects (such as completion warnings, stage visibility and display text)
remain available in `effects`; callers must implement the appropriate UI or
completion workflow before relying on those actions. This is not full Capture UI
parity. Section renderers must honor the returned section `visible` property.

ASSIGN updates `updatedValues` and marks the affected field `ruleAssigned`.
SEMIS GenericFields synchronizes these assignments with React Final Form.
Consumers outside that form renderer must persist `updatedValues` themselves.
Calculated assignments must use valid DHIS2 references such as `#{variable}`.

Run the integration tests against the real engine from the core:

```sh
npm run test:rules
```

The dependency publishes ESM types as `.d.mts`. The adapter's single TypeScript
interop suppression accommodates SEMIS's existing `moduleResolution: node`.
Runtime imports use the official package through Vite's ESM resolution.
