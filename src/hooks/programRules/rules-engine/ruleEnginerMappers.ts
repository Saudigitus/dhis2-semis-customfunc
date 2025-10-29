import { RuleActionJs, RuleAttributeValue, RuleEnrollmentJs, RuleEnrollmentStatus, RuleJs, RuleValueType, RuleVariableJs, RuleVariableType } from "@dhis2/rule-engine";
import { LocalDate } from "@js-joda/core";

export const mapToRuleEnrollment: (e: {
  [key in string]: string | undefined;
}) => RuleEnrollmentJs = (enrollment) => {
  const attributeValues = Object.entries(enrollment).map((entry) => {
    return new RuleAttributeValue(entry[0], entry[1] ?? "");
  });
  // attributeValues.push(new RuleAttributeValue("EPYqXuM0M2u", "DOB"));
  // ToDO: map properly
  const result = new RuleEnrollmentJs(
    "enrollment",
    "programName",
    LocalDate.now(), // incident date
    LocalDate.parse(enrollment.enrollment_date! || "2025-11-29" ), // enrollemntDate
    RuleEnrollmentStatus.ACTIVE,
    "orgUnit",
    "orgUnitCode",
    attributeValues
  );
  return result;
};

export const mapToRuleVariables: (
  variables: typeof semisProgramRulesVariables
) => RuleVariableJs[] = (variables) => {
  return Object.entries(variables).map(([key, val], _) => {
    const result = new RuleVariableJs(
      RuleVariableType.TEI_ATTRIBUTE, // ToDO: type (probably not correct mapping)
      key, // name
      false, // useCodeForOptionSet
      [], // options,
      val, // field
      RuleValueType.DATE, // ToDO: fieldType is hardcoded now (not sure where to get the correct mapping from)
      null // programStage
    );

    return result;
  });
};

export type SemisProgramRule = (typeof semisProgramRules)[0]
export const mapToRule: (rules: SemisProgramRule) => RuleJs = (rule) => {
  const action = new RuleActionJs(
    rule.data,
    rule.type!,
    // ! These are app-specific keys, but adding them to the values map so that we can refer back to them when applying effects as they are returned as part of RuleEffectJs
    new Map([
      ["programRuleActionType", rule.programRuleActionType],
      ["variable", rule.variable!],
    ])
  );

  const kmpRule = new RuleJs(
    rule.condition,
    [action],
    rule.id, // uid
    "", // name
    rule.programStage ?? null,
    rule.priority ?? null
  );

  return kmpRule;
};


const semisProgramRulesVariables = {
  "Academic year": "iDSrFrrVgmX",
  "Amount of bursary for exam fees": "woYJkG3KMga",
  "Amount of bursary for other": "QRl2YSQXsYr",
  "Amount of bursary for school fees": "DXg4BfI9BQx",
  "Attendance status": "d0MKWRNGv0a",
  DOB: "EPYqXuM0M2u",
  "Destiny school": "kQbquG7UivM",
  Grade: "kNNoif9gASf",
  Mathematics: "qPwGZal50yH",
  Nationality: "wGiRDfHT0hj",
  "Receives bursary": "SjMxl9Cwha8",
  full_name: "gz8w04YBSS0",
};

const semisProgramRules = [
  {
    condition: "d2:hasValue(#{Receives bursary})",
    programRuleActionType: "ASSIGN",
    variable: "wsFrk0eBZgi",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    data: "#{Amount of bursary for exam fees} +#{Amount of bursary for other} +#{Amount of bursary for school fees}",
    id: "JRFID0uTgeA",
    program: "wQaiD2V27Dp",
    priority: undefined,
  },
  {
    condition: "d2:hasValue(A{Nationality}) && A{Nationality} == 'zambian'",
    programRuleActionType: "ASSIGN",
    variable: "OsXzFxuvQqy",
    type: "dataElement",
    data: "40",
    id: "jLO88ry548t",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "d2:hasValue(A{Nationality}) && A{Nationality} != 'zambian'",
    programRuleActionType: "ASSIGN",
    variable: "OsXzFxuvQqy",
    type: "dataElement",
    data: "80",
    id: "cbWRBxFx0tU",
    program: "wQaiD2V27Dp",
  },
  {
    condition:
      "d2:hasValue(#{Mathematics}) && (#{Mathematics} < 0 || #{Mathematics} > 20)",
    programRuleActionType: "SHOWERROR",
    variable: "qPwGZal50yH",
    type: "dataElement",
    content: "Marks out of range (0 -20)",
    id: "buIrFhAWOO5",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Attendance status} != 'Absent'",
    programRuleActionType: "HIDEFIELD",
    variable: "oLUMMT84ILM",
    type: "dataElement",
    programStage: "Ljyrr3cktAr",
    id: "X2RZLHTX6ku",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Receives bursary} != 1",
    programRuleActionType: "HIDEFIELD",
    variable: "QRl2YSQXsYr",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    id: "TMEJEoUpSMs",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Receives bursary} != 1",
    programRuleActionType: "HIDEFIELD",
    variable: "woYJkG3KMga",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    id: "P5SomP0Rz4r",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Receives bursary} != 1",
    programRuleActionType: "HIDEFIELD",
    variable: "DXg4BfI9BQx",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    id: "nrl4h8rqPyg",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Receives bursary} != 1",
    programRuleActionType: "HIDEFIELD",
    variable: "H12Bz9ilOf1",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    id: "QtKRGCZrxxB",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Receives bursary} != 1",
    programRuleActionType: "HIDEFIELD",
    variable: "wsFrk0eBZgi",
    type: "dataElement",
    programStage: "Wi3KEZ7C3w9",
    id: "wepHdsiD32I",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "true",
    programRuleActionType: "HIDEOPTION",
    variable: "iDSrFrrVgmX",
    type: "dataElement",
    id: "YOCvHMmXej7",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Grade} == 'Grade 1'",
    programRuleActionType: "HIDEFIELD",
    variable: "cTTpaVY6m1Q",
    type: "dataElement",
    id: "dTBH2b6yRGb",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Grade} == 'Grade 1'",
    programRuleActionType: "HIDEFIELD",
    variable: "w75mLLmHYyS",
    type: "dataElement",
    id: "XDVt6hKwsEf",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "#{Grade} == 'Grade 2'",
    programRuleActionType: "HIDEFIELD",
    variable: "cTTpaVY6m1Q",
    type: "dataElement",
    id: "k9E70AxBd1o",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "d2:inOrgUnitGroup('PS')",
    programRuleActionType: "HIDEOPTIONGROUP",
    variable: "kNNoif9gASf",
    type: "dataElement",
    optionGroup: "Qpdm1zNZDEV",
    id: "NXmBLjI3h2w",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "!d2:hasValue(#{Destiny school})",
    programRuleActionType: "HIDEFIELD",
    variable: "ZdFo5gthBt2",
    type: "dataElement",
    id: "YBsT2m0KKDJ",
    program: "wQaiD2V27Dp",
  },
  {
    condition:
      "#{Attendance status} == 'absent'  || #{Attendance status} == 'Absent'",
    programRuleActionType: "SENDMESSAGE",
    id: "J2M4UMd5squ",
    program: "wQaiD2V27Dp",
  },
  {
    condition:
      "#{Attendance status} == 'absent'  || #{Attendance status} == 'Absent'",
    programRuleActionType: "SHOWWARNING",
    variable: "d0MKWRNGv0a",
    type: "dataElement",
    content: "error test",
    data: "error testing",
    id: "meBSqNvWv42",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "d2:length(A{full_name}) < 2 && d2:hasValue(A{full_name})",
    programRuleActionType: "SHOWERROR",
    variable: "gz8w04YBSS0",
    type: "attribute",
    content:
      "Name must be at least 2 characters long. Please enter a valid name.",
    id: "srzQLiiTAj4",
    program: "wQaiD2V27Dp",
  },
  {
    condition: "d2:hasValue(A{DOB})",
    programRuleActionType: "ASSIGN",
    variable: "l1QCV36yuUy",
    type: "attribute",
    data: "d2:floor( d2:daysBetween( A{DOB}, d2:concatenate( d2:substring( V{enrollment_date}, 0, 4 ), '-06-30' ) ) / 365.25 )",
    id: "XQEnSE8o6dP",
    program: "wQaiD2V27Dp",
  },
];
