import isEqual from "lodash.isequal";
import { useRecoilValue } from "recoil";
import { useState, useEffect } from "react";
import { useFormatProgramRules } from "../hooks/useFormatProgramRules";
import { OptionGroupsConfigState } from "../../../schema/optionGroupsSchema";
import { OrgUnitsGroupsConfigState } from "../../../schema/orgUnitsGroupSchema";
import { useFormatProgramRulesVariables } from "../hooks/useFormatProgramRulesVariables";
import applyRulesToVariable from "./applyRulesToVariable";

interface RulesEngineProps {
    variables: any[]
    values: Record<string, any>
    type: "programStage" | "programStageSection" | "attributesSection"
    program: string,
}

export const CustomDhis2RulesEngine = (props: RulesEngineProps) => {
    const { type, program } = props;
    const getOptionGroups = useRecoilValue(OptionGroupsConfigState);
    const orgUnitsGroups = useRecoilValue(OrgUnitsGroupsConfigState);
    const { programRulesVariables } = useFormatProgramRulesVariables(program);
    const { newProgramRules } = useFormatProgramRules(program);

    const [currentValues, setCurrentValues] = useState({ ...props.values });
    const [updatedVariables, setUpdatedVariables] = useState<any[]>(Array.isArray(props.variables) ? [...props.variables] : []);

    useEffect(() => {
        if (!isEqual(updatedVariables, props.variables)) {
            setUpdatedVariables([...props.variables]);
        }
    }, [props.variables]);

    const contextForRuleEngine:any = {programRulesVariables, newProgramRules, orgUnitsGroups, getOptionGroups}

    function runRulesEngine(arg?: { overrideVariables?: any[], overrideValues?: Record<string, any> }) {
        const { overrideVariables = [], overrideValues = {} } = arg || {};
        const variablesToUse = overrideVariables.length ? overrideVariables : props.variables;
        const valuesToUse = Object.keys(overrideValues).length ? overrideValues : props.values;

        if (!isEqual(currentValues, valuesToUse)) {
            setCurrentValues({ ...valuesToUse });
        }
        if (!isEqual(updatedVariables, variablesToUse)) {
            setUpdatedVariables([...variablesToUse]);
        }

        if (type === "programStageSection") rulesEngineSections(variablesToUse, valuesToUse);
        else if (type === "programStage") rulesEngineDataElements(variablesToUse, valuesToUse);
        else if (type === "attributesSection") rulesEngineAttributesSections(variablesToUse, valuesToUse);
    }

    function rulesEngineAttributesSections(variables: any[], values: Record<string, any>) {
        const updated = variables.map(section => ({
            ...section,
            variable: section.variable.map((variable: any) => {
                const copy = { ...variable };
                return applyRulesToVariable(copy, values, contextForRuleEngine);
            })
        }));
        console.log(updated)
        setUpdatedVariables(updated);
    }

    function rulesEngineSections(variables: any[], values: Record<string, any>) {
        const updated = variables.map(section => ({
            ...section,
            fields: section.fields.map((variable: any) => {
                const copy = { ...variable };
                return applyRulesToVariable(copy, values, contextForRuleEngine);
            })
        }));
        console.log(updated)
        setUpdatedVariables(updated);
    }

    function rulesEngineDataElements(variables: any[], values: Record<string, any>) {
        const updated = variables.map(variable => {
            const copy = { ...variable };
            return applyRulesToVariable(copy, values, contextForRuleEngine);
        });
        console.log(updated)
        setUpdatedVariables(updated);
    }    

    console.log(updatedVariables);

    return {
        runRulesEngine,
        updatedVariables
    };
};
