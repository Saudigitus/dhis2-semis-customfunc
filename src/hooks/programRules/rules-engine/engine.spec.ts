import { expect, describe, it } from "vitest";
import { DateTimeFormatter, LocalDate } from "@js-joda/core";
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
  RuleActionJs,
} from "@dhis2/rule-engine";

describe("Rule Engine", () => {
  it("should run the engine to calculate Age based on DoB", () => {
    const ruleEngine = new RuleEngineJs(true);

    // 1. First step is to map (from API repsonse likely) to the objects expected by the Rule Engine
    const rules = mapToRules(programRulesResponse);
    const ruleVariables = mapToRuleVariables(
      programRuleVariablesResponse.programRuleVariables
    );
    const enrollment = mapToRuleEnrollment(trackedEntityResponse);

    // create the context data
    const contextData: RuleEngineContextJs = new RuleEngineContextJs(
      rules,
      ruleVariables,
      new Map(), // supplementary data
      new Map() // constant values
    );

    const effects = ruleEngine.evaluateEnrollment(enrollment, [], contextData);

    const effectsWithData = effects.filter((effect) => !!effect.data);
    console.debug("[effects with data]", effectsWithData);

    const resultForDobVariable = effects.find((effect) => {
      // using the values map to match back to the variable (this is probably specific to how SEMIS does things, but the values map gives a chance to add extra metadata that can be referred to when consuming and applying effects)
      return effect.ruleAction.values?.get("variable") === "l1QCV36yuUy";
    });

    expect(resultForDobVariable?.data).toEqual("25"); // age should be returned as 25
  });
});

const mapToRuleVariables: (
  programRules: typeof programRuleVariablesResponse.programRuleVariables
) => RuleVariableJs[] = (programRules) => {
  return programRules.map((programRule) => {
    const attributes =
      programRule.dataElement ?? programRule.trackedEntityAttribute;

    const result = new RuleVariableJs(
      // ToDO: not sure about the proper mapping for RuleVariableType
      programRule.trackedEntityAttribute
        ? RuleVariableType.TEI_ATTRIBUTE
        : RuleVariableType.DATAELEMENT_CURRENT_EVENT,
      programRule.name,
      false, // useCodeForOptionSet
      [], // options,
      programRule.dataElement?.id! ?? programRule.trackedEntityAttribute?.id!, // field
      (attributes?.valueType ?? RuleValueType.TEXT) as unknown as RuleValueType,
      null // programStage
    );
    return result;
  });
};

const mapToRules: (rules: typeof programRulesResponse) => RuleJs[] = (
  rules
) => {
  const result = rules
    .map((programRule) => {
      const actions = programRule.programRuleActions.flatMap((ruleAction) => {
        const action = new RuleActionJs(
          ruleAction.data ?? ruleAction.content ?? '',
          // rule.type ?? "",
          ruleAction.dataElement ? "dataelement" : "attribute",
          // ! These are app-specific keys, but adding them to the values map so that we can refer back to them when applying effects as they are returned as part of RuleEffectJs
          new Map([
            ["programRuleActionType", ruleAction.programRuleActionType],
            [
              "variable",
              ruleAction.trackedEntityAttribute?.id ?? ruleAction.dataElement?.id,
            ],
          ])
        );

        return action;
      });

      const kmpRule = new RuleJs(
        programRule.condition,
        actions,
        programRule.id,
        programRule.displayName, 
        programRule.programStage?.id ?? "",
        programRule.priority ?? null
      );
      return kmpRule;
    })
    .flat();

  return result;
};

const mapToRuleEnrollment: (
  e: typeof trackedEntityResponse
) => RuleEnrollmentJs = (trackedEntity) => {
  const attributeValues = trackedEntity.attributes.map((entry) => {
    return new RuleAttributeValue(entry.attribute, entry.value);
  });

  // ToDO: map properly
  const result = new RuleEnrollmentJs(
    trackedEntity.trackedEntity,
    trackedEntity.enrollments[0].program,
    // ! dates needs to be converted Joda dates
    LocalDate.parse(trackedEntity.createdAt, DateTimeFormatter.ISO_DATE_TIME), // incident date
    LocalDate.parse(trackedEntity.createdAt, DateTimeFormatter.ISO_DATE_TIME), // enrollemntDate
    trackedEntity.enrollments[0].status as unknown as RuleEnrollmentStatus, // ToDO: hardcoded enrollments[0]
    trackedEntity.orgUnit,
    trackedEntity.orgUnit,
    attributeValues
  );
  return result;
};

// sample response from /api/programRuleVariables?paging=false&filter=program.id:in:[wQaiD2V27Dp,rmuGQ7kBQBU]&fields=name,dataElement[id,valueType,dimensionItemType],trackedEntityAttribute,program[id]
const programRuleVariablesResponse = {
  programRuleVariables: [
    {
      name: "Academic year",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "TEXT",
        id: "iDSrFrrVgmX",
      },
    },
    {
      name: "Amount of bursary for exam fees",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "INTEGER_ZERO_OR_POSITIVE",
        id: "woYJkG3KMga",
      },
    },
    {
      name: "Amount of bursary for other",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "INTEGER_ZERO_OR_POSITIVE",
        id: "QRl2YSQXsYr",
      },
    },
    {
      name: "Amount of bursary for school fees",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "INTEGER_ZERO_OR_POSITIVE",
        id: "DXg4BfI9BQx",
      },
    },
    {
      name: "Attendance status",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "TEXT",
        id: "d0MKWRNGv0a",
      },
    },
    {
      name: "DOB",
      program: { id: "wQaiD2V27Dp" },
      trackedEntityAttribute: {
        dimensionItemType: "PROGRAM_ATTRIBUTE",
        valueType: "DATE",
        id: "EPYqXuM0M2u",
      },
    },
    {
      name: "Destiny school",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "ORGANISATION_UNIT",
        id: "kQbquG7UivM",
      },
    },
    {
      name: "Grade",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "TEXT",
        id: "kNNoif9gASf",
      },
    },
    {
      name: "Mathematics",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "NUMBER",
        id: "qPwGZal50yH",
      },
    },
    {
      name: "Nationality",
      program: { id: "wQaiD2V27Dp" },
      trackedEntityAttribute: {
        dimensionItemType: "PROGRAM_ATTRIBUTE",
        valueType: "TEXT",
        id: "wGiRDfHT0hj",
      },
    },
    {
      name: "Receives bursary",
      program: { id: "wQaiD2V27Dp" },
      dataElement: {
        dimensionItemType: "DATA_ELEMENT",
        valueType: "BOOLEAN",
        id: "SjMxl9Cwha8",
      },
    },
    {
      name: "full_name",
      program: { id: "wQaiD2V27Dp" },
      trackedEntityAttribute: {
        dimensionItemType: "PROGRAM_ATTRIBUTE",
        valueType: "TEXT",
        id: "gz8w04YBSS0",
      },
    },
  ],
};

// sample response from /api/programRules?paging=false&filter=program.id:in:[wQaiD2V27Dp,rmuGQ7kBQBU]&fields=id,displayName,condition,description,program[id],programStage[id],priority,programRuleActions[id,content,location,data,programRuleActionType,programStageSection[id],dataElement[id],trackedEntityAttribute[id],option[id],optionGroup[id],programIndicator[id],programStage[id]]
const programRulesResponse = [
  {
    program: { id: "wQaiD2V27Dp" },
    programStage: { id: "Wi3KEZ7C3w9" },
    programRuleActions: [
      {
        programRuleActionType: "ASSIGN",
        dataElement: { id: "wsFrk0eBZgi" },
        data: "#{Amount of bursary for exam fees} +#{Amount of bursary for other} +#{Amount of bursary for school fees}",
        id: "JRFID0uTgeA",
      },
    ],
    condition: "d2:hasValue(#{Receives bursary})",
    displayName: "ASSIGN value total amount on bursary",
    id: "gvdPWR6waqp",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "ASSIGN",
        dataElement: { id: "OsXzFxuvQqy" },
        data: "40",
        id: "jLO88ry548t",
      },
    ],
    condition: "d2:hasValue(A{Nationality}) && A{Nationality} == 'zambian'",
    priority: 1,
    displayName: "Assign 40 kwacha for national",
    id: "ZaG7iByTOWG",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "ASSIGN",
        dataElement: { id: "OsXzFxuvQqy" },
        data: "80",
        id: "cbWRBxFx0tU",
      },
    ],
    condition: "d2:hasValue(A{Nationality}) && A{Nationality} != 'zambian'",
    priority: 1,
    displayName: "Assign 80 kwacha for foreigners",
    id: "cXsNs118Q0h",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "SHOWERROR",
        dataElement: { id: "qPwGZal50yH" },
        content: "Marks out of range (0 -20)",
        id: "buIrFhAWOO5",
      },
    ],
    condition:
      "d2:hasValue(#{Mathematics}) && (#{Mathematics} < 0 || #{Mathematics} > 20)",
    priority: 0,
    displayName: "Check Mathematics range",
    id: "S33q8cojZLH",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programStage: { id: "Ljyrr3cktAr" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "oLUMMT84ILM" },
        id: "X2RZLHTX6ku",
      },
    ],
    condition: "#{Attendance status} != 'Absent'",
    displayName: "HIDE Reason for absence if attendance status is not absent",
    id: "C3gcW5b2iuT",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programStage: { id: "Wi3KEZ7C3w9" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "QRl2YSQXsYr" },
        id: "TMEJEoUpSMs",
      },
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "woYJkG3KMga" },
        id: "P5SomP0Rz4r",
      },
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "H12Bz9ilOf1" },
        id: "QtKRGCZrxxB",
      },
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "DXg4BfI9BQx" },
        id: "nrl4h8rqPyg",
      },
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "wsFrk0eBZgi" },
        id: "wepHdsiD32I",
      },
    ],
    condition: "#{Receives bursary} != 1",
    displayName: "HIDE questions on bursary if not on bursary",
    id: "NjsA9bY5dHT",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEOPTION",
        dataElement: { id: "iDSrFrrVgmX" },
        option: { id: "dz75dE4jkGL" },
        id: "YOCvHMmXej7",
      },
    ],
    condition: "true",
    displayName: "Hide 2021 AY",
    id: "AYBwoQggwyv",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "w75mLLmHYyS" },
        id: "XDVt6hKwsEf",
      },
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "cTTpaVY6m1Q" },
        id: "dTBH2b6yRGb",
      },
    ],
    condition: "#{Grade} == 'Grade 1'",
    priority: 0,
    displayName: 'Hide non "Grade 1 Subjects"',
    id: "IjOT22mTQcQ",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "cTTpaVY6m1Q" },
        id: "k9E70AxBd1o",
      },
    ],
    condition: "#{Grade} == 'Grade 2'",
    priority: 0,
    displayName: 'Hide non "Grade 2 Subjects"',
    id: "PVEYZPcZqJu",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEOPTIONGROUP",
        dataElement: { id: "kNNoif9gASf" },
        optionGroup: { id: "Qpdm1zNZDEV" },
        id: "NXmBLjI3h2w",
      },
    ],
    condition: "d2:inOrgUnitGroup('PS')",
    displayName: "Hide non Primary Schools Grades",
    id: "YjOA0RpwRWI",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "HIDEFIELD",
        dataElement: { id: "ZdFo5gthBt2" },
        id: "YBsT2m0KKDJ",
      },
    ],
    condition: "!d2:hasValue(#{Destiny school})",
    displayName: "Hide reason for transfer if destiny school is null",
    id: "VC2Yg4hJh8k",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      { programRuleActionType: "SENDMESSAGE", id: "J2M4UMd5squ" },
      {
        programRuleActionType: "SHOWWARNING",
        dataElement: { id: "d0MKWRNGv0a" },
        content: "error test",
        data: "error testing",
        id: "meBSqNvWv42",
      },
    ],
    condition:
      "#{Attendance status} == 'absent'  || #{Attendance status} == 'Absent'",
    displayName: "Program rule: SMS notification",
    id: "mBe4UeP788o",
  },
  {
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "SHOWERROR",
        content:
          "Name must be at least 2 characters long. Please enter a valid name.",
        id: "srzQLiiTAj4",
        trackedEntityAttribute: { id: "gz8w04YBSS0" },
      },
    ],
    condition: "d2:length(A{full_name}) < 2 && d2:hasValue(A{full_name})",
    displayName: "Validation full name - teste",
    id: "z9tcqCa9tGz",
  },
  {
    description: "calculate age from date of birth",
    program: { id: "wQaiD2V27Dp" },
    programRuleActions: [
      {
        programRuleActionType: "ASSIGN",
        data: "d2:floor( d2:daysBetween( A{DOB}, d2:concatenate( d2:substring( V{enrollment_date}, 0, 4 ), '-06-30' ) ) / 365.25 )",
        id: "XQEnSE8o6dP",
        trackedEntityAttribute: { id: "l1QCV36yuUy" },
      },
    ],
    condition: "d2:hasValue(A{DOB})",
    priority: 1,
    displayName: "calculate age from date of birth",
    id: "qPctuTa3ME6",
  },
];

// sample response from /api/trackedEntities/rPhdFH6Vnlz?fields=trackedEntity%2CcreatedAt%2CorgUnit%2Cattributes[attribute%2Cvalue]%2Cenrollments[enrollment%2CorgUnit%2Cprogram%2Cstatus]%2CprogramOwners[orgUnit]&ouMode=SELECTED&skipPaging=true&program=wQaiD2V27Dp&trackedEntity=rPhdFH6Vnlz&orgUnit=vCrGxfUrgMN
const trackedEntityResponse = {
  trackedEntity: "rPhdFH6Vnlz",
  createdAt: "2025-04-14T08:39:57.514",
  orgUnit: "vCrGxfUrgMN",
  attributes: [
    { attribute: "X0vzx18XWqu", value: "male" },
    { attribute: "gz8w04YBSS0", value: "Albert" },
    {
      attribute: "SwfMi3g9k4s",
      value: "P.O.Box 24456, PLOT 3 Makindye Luwafu Ganafa Road",
    },
    { attribute: "G0B8B0AH5Ek", value: "2025-00001133" },
    { attribute: "l1QCV36yuUy", value: "12" },
    { attribute: "ZIDlK6BaAU2", value: "Mutesasira" },
    { attribute: "wGiRDfHT0hj", value: "albanian" },
    { attribute: "tWYfZZjmYgm", value: "0700372842" },
    { attribute: "EPYqXuM0M2u", value: "2000-01-01" }, // TE Date of birth
    { attribute: "SSRTWWEPn15", value: "2025-10358000" },
  ],
  enrollments: [
    {
      enrollment: "JW9IOEf5LGg",
      program: "wQaiD2V27Dp",
      status: "COMPLETED",
      orgUnit: "vCrGxfUrgMN",
    },
    {
      enrollment: "Qg93LJhik9G",
      program: "wQaiD2V27Dp",
      status: "COMPLETED",
      orgUnit: "vCrGxfUrgMN",
    },
  ],
  programOwners: [{ orgUnit: "vCrGxfUrgMN" }],
};
