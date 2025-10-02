import { expect, describe, it } from "vitest";
import applyRulesToVariable from "./applyRulesToVariable"

describe.only('applyRulesToVariables', () => {
    it('should run the engine to calculate Age based on DoB', () => {
        let calculatedAge = values['l1QCV36yuUy']
        expect(calculatedAge).toBeUndefined() // no age initially
        applyRulesToVariable(ageVariable, values, {programRulesVariables, newProgramRules, orgUnitsGroups})
        calculatedAge = values['l1QCV36yuUy']
        expect(calculatedAge).toEqual("22") // age should become 22 based on the rule
    })
    it('should run the engine with HIDE rule', () => {
        const valueBefore = variableWithHide.visible
        expect(valueBefore).toBe(true)
        applyRulesToVariable(variableWithHide, values, {programRulesVariables, newProgramRules, orgUnitsGroups})
        expect(valueBefore).not.toEqual(variableWithHide.visible)
        expect(variableWithHide.visible).toBe(false)
    })
    it('should run the engine with SHOW_ERROR rule', () => {
        const valueBefore = {...variableWithShowError}
        applyRulesToVariable(variableWithShowError, values, {programRulesVariables, newProgramRules, orgUnitsGroups})
        expect(valueBefore).not.toEqual(variableWithShowError)
        expect(variableWithShowError.content).toEqual('Name must be at least 2 characters long. Please enter a valid name.')
    })
})

const values = {
  "orgUnit": "Shc3qNhrPAz",
  "registerschoolstaticform": "Albion LBS 2082",
  "enrollment_date": "2023-09-02",
  "G0B8B0AH5Ek": "2025-00004173",
  "SSRTWWEPn15": "2025-0d725788",
  "EPYqXuM0M2u": "2000-09-01",
  "l1QCV36yuUy": undefined,
  "X0vzx18XWqu": "female"
}

const ageVariable = {
  "required": false,
  "name": "l1QCV36yuUy",
  "labelName": "Age",
  "valueType": "INTEGER_POSITIVE",
  "options": {},
  "initialOptions": {},
  "visible": true,
  "disabled": false,
  "pattern": "",
  "searchable": false,
  "error": false,
  "warning": false,
  "content": "",
  "id": "l1QCV36yuUy",
  "displayName": "Age",
  "header": "Age",
  "type": "attribute",
  "programStage": "",
  "unique": false
}

const variableWithHide = {
  "required": false,
  "name": "H12Bz9ilOf1",
  "labelName": "LI6b - General bursary information: Source(s) of bursary",
  "valueType": "LIST",
  "options": {
    "optionSet": {
      "options": [
        {
          "value": "Government",
          "label": "Government"
        },
        {
          "value": "International Scholarship",
          "label": "International Scholarship"
        },
        {
          "value": "Local Scholarship",
          "label": "Local Scholarship"
        },
        {
          "value": "National Board",
          "label": "National Board"
        },
        {
          "value": "Private",
          "label": "Private"
        },
        {
          "value": "Others",
          "label": "Others"
        }
      ]
    }
  },
  "initialOptions": {
    "optionSet": {
      "options": [
        {
          "value": "Government",
          "label": "Government"
        },
        {
          "value": "International Scholarship",
          "label": "International Scholarship"
        },
        {
          "value": "Local Scholarship",
          "label": "Local Scholarship"
        },
        {
          "value": "National Board",
          "label": "National Board"
        },
        {
          "value": "Private",
          "label": "Private"
        },
        {
          "value": "Others",
          "label": "Others"
        }
      ]
    }
  },
  "disabled": false,
  "pattern": "",
  "visible": true,
  "description": "LI6b - General bursary information: Source(s) of bursary",
  "error": false,
  "programStage": "Wi3KEZ7C3w9",
  "content": "",
  "id": "H12Bz9ilOf1",
  "displayName": "LI6b - General bursary information: Source(s) of bursary",
  "header": "LI6b - General bursary information: Source(s) of bursary",
  "type": "dataElement"
}

const variableWithShowError = {
  "required": true,
  "name": "gz8w04YBSS0",
  "labelName": "First name",
  "valueType": "TEXT",
  "options": {},
  "initialOptions": {},
  "visible": true,
  "disabled": false,
  "pattern": "",
  "searchable": true,
  "error": true,
  "warning": false,
  "content": "Name must be at least 2 characters long. Please enter a valid name.",
  "id": "gz8w04YBSS0",
  "displayName": "First name",
  "header": "First name",
  "type": "attribute",
  "programStage": "",
  "unique": false
}

const newProgramRules = [
  {
    "condition": "d2:hasValue(#{Receives bursary})",
    "programRuleActionType": "ASSIGN",
    "variable": "wsFrk0eBZgi",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "data": "#{Amount of bursary for exam fees} +#{Amount of bursary for other} +#{Amount of bursary for school fees}",
    "id": "JRFID0uTgeA",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:hasValue(A{Nationality}) && A{Nationality} == 'zambian'",
    "programRuleActionType": "ASSIGN",
    "variable": "OsXzFxuvQqy",
    "type": "dataElement",
    "data": "40",
    "id": "jLO88ry548t",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:hasValue(A{Nationality}) && A{Nationality} != 'zambian'",
    "programRuleActionType": "ASSIGN",
    "variable": "OsXzFxuvQqy",
    "type": "dataElement",
    "data": "80",
    "id": "cbWRBxFx0tU",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:hasValue(#{Mathematics}) && (#{Mathematics} < 0 || #{Mathematics} > 20)",
    "programRuleActionType": "SHOWERROR",
    "variable": "qPwGZal50yH",
    "type": "dataElement",
    "content": "Marks out of range (0 -20)",
    "id": "buIrFhAWOO5",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Attendance status} != 'Absent'",
    "programRuleActionType": "HIDEFIELD",
    "variable": "oLUMMT84ILM",
    "type": "dataElement",
    "programStage": "Ljyrr3cktAr",
    "id": "X2RZLHTX6ku",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Receives bursary} != 1",
    "programRuleActionType": "HIDEFIELD",
    "variable": "QRl2YSQXsYr",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "id": "TMEJEoUpSMs",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Receives bursary} != 1",
    "programRuleActionType": "HIDEFIELD",
    "variable": "woYJkG3KMga",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "id": "P5SomP0Rz4r",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Receives bursary} != 1",
    "programRuleActionType": "HIDEFIELD",
    "variable": "DXg4BfI9BQx",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "id": "nrl4h8rqPyg",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Receives bursary} != 1",
    "programRuleActionType": "HIDEFIELD",
    "variable": "H12Bz9ilOf1",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "id": "QtKRGCZrxxB",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Receives bursary} != 1",
    "programRuleActionType": "HIDEFIELD",
    "variable": "wsFrk0eBZgi",
    "type": "dataElement",
    "programStage": "Wi3KEZ7C3w9",
    "id": "wepHdsiD32I",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "true",
    "programRuleActionType": "HIDEOPTION",
    "variable": "iDSrFrrVgmX",
    "type": "dataElement",
    "id": "YOCvHMmXej7",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Grade} == 'Grade 1'",
    "programRuleActionType": "HIDEFIELD",
    "variable": "cTTpaVY6m1Q",
    "type": "dataElement",
    "id": "dTBH2b6yRGb",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Grade} == 'Grade 1'",
    "programRuleActionType": "HIDEFIELD",
    "variable": "w75mLLmHYyS",
    "type": "dataElement",
    "id": "XDVt6hKwsEf",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Grade} == 'Grade 2'",
    "programRuleActionType": "HIDEFIELD",
    "variable": "cTTpaVY6m1Q",
    "type": "dataElement",
    "id": "k9E70AxBd1o",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:inOrgUnitGroup('PS')",
    "programRuleActionType": "HIDEOPTIONGROUP",
    "variable": "kNNoif9gASf",
    "type": "dataElement",
    "optionGroup": "Qpdm1zNZDEV",
    "id": "NXmBLjI3h2w",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "!d2:hasValue(#{Destiny school})",
    "programRuleActionType": "HIDEFIELD",
    "variable": "ZdFo5gthBt2",
    "type": "dataElement",
    "id": "YBsT2m0KKDJ",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Attendance status} == 'absent'  || #{Attendance status} == 'Absent'",
    "programRuleActionType": "SENDMESSAGE",
    "id": "J2M4UMd5squ",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "#{Attendance status} == 'absent'  || #{Attendance status} == 'Absent'",
    "programRuleActionType": "SHOWWARNING",
    "variable": "d0MKWRNGv0a",
    "type": "dataElement",
    "content": "error test",
    "data": "error testing",
    "id": "meBSqNvWv42",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:length(A{full_name}) < 2 && d2:hasValue(A{full_name})",
    "programRuleActionType": "SHOWERROR",
    "variable": "gz8w04YBSS0",
    "type": "attribute",
    "content": "Name must be at least 2 characters long. Please enter a valid name.",
    "id": "srzQLiiTAj4",
    "program": "wQaiD2V27Dp"
  },
  {
    "condition": "d2:hasValue(A{DOB})",
    "programRuleActionType": "ASSIGN",
    "variable": "l1QCV36yuUy",
    "type": "attribute",
    "data": "d2:floor( d2:daysBetween( A{DOB}, d2:concatenate( d2:substring( V{enrollment_date}, 0, 4 ), '-06-30' ) ) / 365.25 )",
    "id": "XQEnSE8o6dP",
    "program": "wQaiD2V27Dp"
  }
]

const programRulesVariables = {
  "Academic year": "iDSrFrrVgmX",
  "Amount of bursary for exam fees": "woYJkG3KMga",
  "Amount of bursary for other": "QRl2YSQXsYr",
  "Amount of bursary for school fees": "DXg4BfI9BQx",
  "Attendance status": "d0MKWRNGv0a",
  "DOB": "EPYqXuM0M2u",
  "Destiny school": "kQbquG7UivM",
  "Grade": "kNNoif9gASf",
  "Mathematics": "qPwGZal50yH",
  "Nationality": "wGiRDfHT0hj",
  "Receives bursary": "SjMxl9Cwha8",
  "full_name": "gz8w04YBSS0"
}

const orgUnitsGroups = [  
  {
    "organisationUnits": [
      {
        "label": "Albion LBS 2082",
        "value": "Shc3qNhrPAz"
      },
    ],
    "label": "Albion"
  }
]