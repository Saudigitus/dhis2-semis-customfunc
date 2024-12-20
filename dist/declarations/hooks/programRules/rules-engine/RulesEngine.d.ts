import { RulesEngineProps } from "../../../types/programRules/RulesEngineProps";
/**
 * The function that implements the program rules.
 * @returns {{ runRulesEngine: (data?: {}) => void; updatedVariables: any; }} The fields modified based on their values and program rule.
 *
 *  @example
 * Example usage:
 export const RulesEngineForm = (props: any) => {
    
    const onError = (message: string) => {
        console.error(message)
    }

    const { runRulesEngine, updatedVariables } = RulesEngine({
        variables: [] // an array of valid variables,
          values: { "id": "value", ...},
        type: RulesType.ProgramStageSection,
        onError: onError
    })

    useEffect(() => {
        runRulesEngine(fields)
    }, [values])

    return (
        <Form>
            updatedVariables?.map((field: any, index: number) => {
                return (
                    <GroupForm
                        key={index}
                        name={field.section}
                        fields={field.fields}
                        description={field.description}
                    />
                )
            })
        </Form>
    )
}
*/
export declare const RulesEngine: (props: RulesEngineProps) => {
    runRulesEngine: (data?: import("dhis2-semis-components").GroupFormProps[] | import("dhis2-semis-components").CustomAttributeProps[]) => void;
    updatedVariables: import("dhis2-semis-components").GroupFormProps[] | import("dhis2-semis-components").CustomAttributeProps[];
};
/** A function to remove characters that are not reconized on Js to make possible to run eval() function. */
export declare function removeSpecialCharacters(text: string | undefined): string | undefined;
/** Replaces condition with specific variable. */
export declare function replaceConditionVariables(condition: string | undefined, variables: Record<string, string | undefined>): string | undefined;
/** Gets function name of the program rule. */
export declare function getFunctionExpression(condition: string | undefined): string | undefined;
/** Replaces variables ids with specific value sent from the component which implements the rule. */
export declare function replaceEspecifValue(values: Record<string, any>, variables: Record<string, string>, variable: string): string | false;
/** Replaces variable value with the corresponding condition. */
export declare function existValue(condition: string | undefined, values: Record<string, any> | undefined, formatKeyValueType: any): string;
/** Gets the  valueType for variables of a section. */
export declare function getValueTypeVariable(variables: any, variable: any): string;
