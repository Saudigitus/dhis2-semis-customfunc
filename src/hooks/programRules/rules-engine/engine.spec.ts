import { expect, describe, it } from "vitest";
import { LocalDate } from "@js-joda/core";
import {
  RuleAttributeValue,
  RuleEngineContextJs,
  RuleEngineJs,
  RuleEnrollmentJs,
  RuleEnrollmentStatus,
  RuleJs,
  RuleValueType,
  RuleVariableJs,
  RuleVariableType,
} from "@dhis2/rule-engine";

// ! this is a hack for now, to avoid using an object constructor and just use object literal
// ? Is there a a way to build the objects for things like RuleVariable other than the constructor
const otherProps = {
  copy: () => {
    return "1" as any;
  },
  hashCode: () => 123131,
  equals: () => {
    return true;
  },
};
describe("Rule Engine", () => {
  it.only("should run the engine to calculate Age based on DoB", () => {
    const ruleEngine = new RuleEngineJs(true);
    //! 1. mapping layer from API response to KMP format
    //? reason for different model
    
    const rules: RuleJs[] = [
      {
        name: "Age rule",
        condition: "d2:hasValue(A{DOB})",
        // ? are programRuleActionType a Tracker or SEMIS concept ?
        // programRuleActionType: "ASSIGN",
        // variable: "l1QCV36yuUy",
        // id: "XQEnSE8o6dP",
        // program: "wQaiD2V27Dp",
        uid: '',
        programStage: '',
        priority: 1,
        ...otherProps,
        actions: [
          {
            data: "d2:floor( d2:daysBetween( A{DOB}, d2:concatenate( d2:substring( V{enrollment_date}, 0, 4 ), '-06-30' ) ) / 365.25 )",
            type: "attribute",
            // ? what is this values map?
            values: new Map(),
            ...otherProps
          },
        ],
      },
    ];

    const ruleVariables: RuleVariableJs[] = [
      {
        type: RuleVariableType.TEI_ATTRIBUTE,
        name: "DOB",
        field: "EPYqXuM0M2u",
        fieldType: RuleValueType.DATE,
        options: [],
        useCodeForOptionSet: false,
        programStage: null,
        ...otherProps
      },
    ] ;

    const contextData: RuleEngineContextJs = {
      rules,
      supplementaryData: new Map(),
      constantsValues: new Map(),
      ruleVariables,
    } as RuleEngineContextJs;

    const result = ruleEngine.evaluateEnrollment(enrollment, [], contextData);

    // ? is it on purpose that this returns strings?
    expect(result[0].data).toEqual("25"); // age should be returned as 25
  });
});

const enrollment: RuleEnrollmentJs = {
  enrollment: "KpknKHptul0",
  programName: "test program",
  status: RuleEnrollmentStatus.COMPLETED,
  organisationUnit: "DiszpKrYNg8",
  organisationUnitCode: "OU_559",
  incidentDate: LocalDate.parse("2025-01-01"),
  enrollmentDate: LocalDate.parse("2025-01-01"),
  attributeValues: [
    new RuleAttributeValue("zDhUuAYrxNC", "Ryder"),
    new RuleAttributeValue("cejWyOfXge6", "Female"),
    new RuleAttributeValue("w75KJ2mc4zz", "Filona"),
    new RuleAttributeValue("EPYqXuM0M2u", "2000-01-01"),
  ],
  ...otherProps
};
