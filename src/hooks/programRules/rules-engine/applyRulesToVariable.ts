import { RuleEngineContextJs, RuleEngineJs } from "@dhis2/rule-engine";
import { mapToRule, mapToRuleEnrollment, mapToRuleVariables, SemisProgramRule } from "./ruleEnginerMappers";

export default function applyRulesToVariable(
  variable: any,
  values: Record<string, any>,
  {
    programRulesVariables,
    newProgramRules,
    orgUnitsGroups,
    getOptionGroups,
  }: {
    programRulesVariables: any;
    newProgramRules: SemisProgramRule[];
    orgUnitsGroups: any;
    getOptionGroups?: any;
  }
) {
  // ToDo: this whole calculation should be moved a step up
  // since it doesn't need to work on a single variable at a time with the Rule Engine
  const ruleEngine = new RuleEngineJs(true);
  const rules = newProgramRules.map(mapToRule);
  const ruleVariables = mapToRuleVariables(programRulesVariables);
  const executionContext: RuleEngineContextJs = new RuleEngineContextJs(
    rules,
    ruleVariables,
    new Map(),
    new Map()
  )

  const conditionResult = ruleEngine.evaluateEnrollment(
            mapToRuleEnrollment(values),
            [],
            executionContext,
        )

  // no need to filter here anymore as only applied effects are returned
  for (const rule of conditionResult) {
    switch (rule.ruleAction?.values?.get("programRuleActionType")) {
      case "ASSIGN":
        const newValue = rule.data
        values[variable.id] = newValue ?? "";
        variable["value"] = newValue;
        variable.disabled = true;
        break;

      // ToDO: update to support SHOWOPTIONGROUP
      // case "SHOWOPTIONGROUP":
      //   if (conditionResult) {
      //     const options =
      //       getOptionGroups?.find((op:any) => op.id === rule.optionGroup)
      //         ?.options || [];
      //     variable.options = { optionSet: { options } };
      //   }
      //   break;

      case "SHOWWARNING":
        variable.warning = !!conditionResult;
        variable.content = conditionResult ? rule.ruleAction.data : "";
        break;

      case "SHOWERROR":
        variable.error = !!conditionResult;
        variable.required = !!conditionResult;
        variable.content = rule.ruleAction.data;
        break;

      case "HIDEFIELD":
        variable.visible = !conditionResult;
        break;

      // !ToDO
      // case "HIDEOPTIONGROUP":
      //   if (
      //     conditionResult &&
      //     conditionResult[0]?.organisationUnits?.some(
      //       (x: any) => x.value === values["orgUnit"]
      //     )
      //   ) {
      //     const groupOptions =
      //       getOptionGroups?.find((op) => op.id === rule.optionGroup)
      //         ?.options || [];
      //     const initial = variable.initialOptions?.optionSet?.options || [];
      //     variable.options = {
      //       optionSet: {
      //         options: (variable.optionSet?.options || initial).filter(
      //           (o1: any) =>
      //             !groupOptions.some((o2: any) => o2.value === o1.value)
      //         ),
      //       },
      //     };
      //   } else if (
      //     !conditionResult &&
      //     variable.initialOptions?.optionSet?.options
      //   ) {
      //     variable.options = {
      //       optionSet: {
      //         options: variable.initialOptions?.optionSet?.options || [],
      //       },
      //     };
      //   }
      //   break;
    }
  }
  return variable;
}
