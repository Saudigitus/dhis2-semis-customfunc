// Upstream ships .d.mts declarations, unsupported by this project's legacy
// moduleResolution: node. The interop exception stays at this boundary.
// @ts-ignore -- resolve upstream types after the project's module-resolution migration
import * as Engine from '@dhis2/rule-engine';

export interface EvaluationInput {
    program: string;
    variables: any[];
    values: Record<string, any>;
    type?: 'programStage' | 'programStageSection' | 'attributesSection';
    rules: any[];
    ruleVariables: any[];
    optionGroups?: any[];
    orgUnitGroups?: any[];
    context?: {
        enrollment?: Record<string, any>;
        event?: Record<string, any>;
        events?: Record<string, any>[];
        userRoles?: string[];
        userGroups?: string[];
        constants?: Record<string, string>;
        evaluation?: 'event' | 'enrollment';
    };
}

const numeric = /^(NUMBER|INTEGER.*|PERCENTAGE|UNIT_INTERVAL)$/;
const present = (v: any) => v !== null && v !== undefined && v !== '';
const date = (v: any, fallback: any = null) => v ? Engine.RuleLocalDate.parse(String(v).slice(0, 10)) : fallback;

// Form layout is determined by actual child collections, not by evaluation type.
const sectionKeys = (item: any) => ['fields', 'variable', 'variables'].filter(key => Array.isArray(item[key]));
const collectFields = (items: any[]): any[] => items.flatMap(item => {
    const keys = sectionKeys(item);
    return keys.length ? keys.flatMap(key => collectFields(item[key])) : [item];
});

/** Convert SEMIS inputs; all expression parsing and evaluation belongs to DHIS2. */
export function evaluateProgramRules(input: EvaluationInput) {
    const { values, program, context = {} } = input;
    const metadata = input.ruleVariables.filter(v => v.program?.id === program);
    const rules = input.rules.filter(r => r.program?.id === program);
    const fields = collectFields(input.variables);
    const actions = rules.flatMap(r => r.programRuleActions ?? []);
    const ids = (kind: string) => new Set<string>([
        ...metadata.map(v => v[kind]?.id), ...actions.map(a => a[kind]?.id),
    ].filter(Boolean));
    const attributeIds = ids('trackedEntityAttribute');
    const dataElementIds = ids('dataElement');
    const orgUnit = String(values.orgUnit ?? values.orgUnitId ?? context.event?.orgUnit ?? context.enrollment?.orgUnit ?? '');
    const convertEvent = (event: Record<string, any>) => new Engine.RuleEventJs(
        event.event ?? event.programStageEvent ?? '', event.programStage ?? '', '',
        Engine.RuleEventStatus[event.status] ?? Engine.RuleEventStatus.ACTIVE,
        date(event.occurredAt ?? event.event_date), event.createdAt ? Engine.RuleInstant.parse(event.createdAt) : Engine.RuleInstant.now(), null,
        date(event.scheduledAt), date(event.completedAt), event.orgUnit ?? orgUnit, event.orgUnitCode ?? null,
        event.dataValues ? event.dataValues.map((v: any) => new Engine.RuleDataValue(v.dataElement, String(v.value))) :
            [...dataElementIds].filter(id => present(event[id])).map(id => new Engine.RuleDataValue(id, String(event[id]))),
    );
    const enrollmentData = { ...values, ...context.enrollment };
    const enrollment = new Engine.RuleEnrollmentJs(
        enrollmentData.enrollment ?? enrollmentData.enrollmentId ?? 'registration', '',
        date(context.enrollment?.occurredAt ?? enrollmentData.incident_date, Engine.RuleLocalDate.currentDate()),
        date(enrollmentData.enrolledAt ?? enrollmentData.enrollment_date, Engine.RuleLocalDate.currentDate()),
        Engine.RuleEnrollmentStatus[enrollmentData.enrollmentStatus] ?? Engine.RuleEnrollmentStatus.ACTIVE,
        orgUnit, enrollmentData.orgUnitCode ?? null,
        [...attributeIds].filter(id => present(enrollmentData[id])).map(id => new Engine.RuleAttributeValue(id, String(enrollmentData[id]))),
    );
    const executionContext = new Engine.RuleEngineContextJs(
        rules.map(r => new Engine.RuleJs(r.condition ?? '', (r.programRuleActions ?? []).map((a: any) => {
            const entries = new Map<string, string>();
            for (const key of ['id', 'content', 'location']) if (a[key] != null) entries.set(key, a[key]);
            for (const key of ['dataElement', 'trackedEntityAttribute', 'programStage', 'programStageSection', 'option', 'optionGroup']) {
                if (a[key]?.id) entries.set(`${key}Id`, a[key].id);
            }
            if (a.programRuleActionType === 'ASSIGN') {
                const field = a.dataElement?.id ?? a.trackedEntityAttribute?.id;
                if (field) entries.set('field', field);
                entries.set('attributeType', a.dataElement ? 'DATA_ELEMENT' : a.trackedEntityAttribute ? 'TRACKED_ENTITY_ATTRIBUTE' : 'UNKNOWN');
            }
            return new Engine.RuleActionJs(a.data ?? null, a.programRuleActionType, entries, a.priority ?? null);
        }), r.id, r.displayName ?? null, r.programStage?.id ?? null, r.priority ?? null)),
        metadata.map(v => {
            const field = v.dataElement ?? v.trackedEntityAttribute;
            const valueType = field?.valueType ?? fields.find(f => f.id === field?.id)?.valueType ?? 'TEXT';
            const source = v.programRuleVariableSourceType;
            if (!source || !Engine.RuleVariableType[source]) throw new Error(`Missing or unsupported source type for rule variable ${v.name}`);
            return new Engine.RuleVariableJs(Engine.RuleVariableType[source], v.name, !v.useNameForOptionSet,
                (field?.optionSet?.options ?? []).map((o: any) => new Engine.Option(o.displayName, o.code)),
                field?.id ?? '', numeric.test(valueType) ? Engine.RuleValueType.NUMERIC :
                    /^(BOOLEAN|TRUE_ONLY)$/.test(valueType) ? Engine.RuleValueType.BOOLEAN :
                    /^(DATE|DATETIME|AGE)$/.test(valueType) ? Engine.RuleValueType.DATE : Engine.RuleValueType.TEXT,
                v.programStage?.id ?? null);
        }),
        new Engine.RuleSupplementaryDataJs(context.userGroups ?? [], context.userRoles ?? [],
            new Map((input.orgUnitGroups ?? []).flatMap(g => [g.id, g.value].filter(Boolean).map(key => [key, g.organisationUnits.map((ou: any) => ou.value ?? ou.id)])))),
        new Map(Object.entries(context.constants ?? {})),
    );
    const engine = new Engine.RuleEngineJs();
    const events = (context.events ?? []).map(convertEvent);
    const eventData = { ...values, ...context.event };
    const evaluation = context.evaluation ?? (input.type === 'attributesSection' && !context.event ? 'enrollment' : 'event');
    const effects: any[] = evaluation === 'enrollment'
        ? engine.evaluateEnrollment(enrollment, events, executionContext)
        : engine.evaluateEvent(convertEvent(eventData), enrollment, events.filter(e => e.event !== (eventData.event ?? eventData.programStageEvent ?? '')), executionContext);
    const updatedValues = { ...values };
    const updateField = (field: any) => {
        const copy = { ...field };
        const matching = effects.filter(e => [e.ruleAction.values.get('field'), e.ruleAction.values.get('dataElementId'), e.ruleAction.values.get('trackedEntityAttributeId')].includes(field.id));
        const shownGroups: any[] = [];
        const hiddenOptions = new Set<string>();
        for (const effect of matching) {
            const action = effect.ruleAction;
            const message = [action.values.get('content'), effect.data].filter(present).join(' ');
            switch (action.type) {
                case 'ASSIGN': {
                    const raw = effect.data ?? '';
                    const assigned = numeric.test(field.valueType) && raw !== '' ? Number(raw) :
                        /^(BOOLEAN|TRUE_ONLY)$/.test(field.valueType) && raw !== '' ? raw === 'true' : raw;
                    copy.value = assigned; copy.ruleAssigned = true; copy.disabled = true; updatedValues[field.id] = assigned;
                    break;
                }
                case 'HIDEFIELD': copy.visible = false; break;
                case 'SETMANDATORYFIELD': copy.required = true; break;
                case 'SHOWERROR': copy.error = true; copy.content = [copy.content, message].filter(Boolean).join('\n'); break;
                case 'SHOWWARNING': copy.warning = true; copy.content = [copy.content, message].filter(Boolean).join('\n'); break;
                case 'HIDEOPTION': hiddenOptions.add(action.values.get('optionId')); break;
                case 'SHOWOPTIONGROUP':
                case 'HIDEOPTIONGROUP': {
                    const options = input.optionGroups?.find(g => g.id === action.values.get('optionGroupId'))?.options ?? [];
                    if (action.type === 'SHOWOPTIONGROUP') shownGroups.push(...options);
                    else options.forEach((o: any) => hiddenOptions.add(o.id ?? o.value ?? o.code));
                    break;
                }
            }
        }
        const initial = field.initialOptions?.optionSet?.options ?? field.options?.optionSet?.options ?? field.optionSet?.options;
        if (initial) {
            const show = matching.some(e => e.ruleAction.type === 'SHOWOPTIONGROUP');
            const options = initial.filter((o: any) => {
                const keys = [o.id, o.value, o.code].filter(Boolean);
                return !keys.some(k => hiddenOptions.has(k)) && (!show || shownGroups.some(g => keys.includes(g.id ?? g.value ?? g.code)));
            });
            copy.options = { ...field.options, optionSet: { ...field.options?.optionSet, options } };
        }
        return copy;
    };
    const updateItem = (item: any, parentHidden = false): any => {
        const keys = sectionKeys(item);
        if (!keys.length) return { ...updateField(item), ...(parentHidden ? { visible: false } : {}) };
        const hidden = parentHidden || effects.some(e => e.ruleAction.type === 'HIDESECTION' && e.ruleAction.values.get('programStageSectionId') === item.id);
        return { ...item, ...(hidden ? { visible: false } : {}),
            ...Object.fromEntries(keys.map(key => [key, item[key].map((child: any) => updateItem(child, hidden))])) };
    };
    const updatedVariables = input.variables.map(item => updateItem(item));
    return { updatedVariables, updatedValues, effects };
}
