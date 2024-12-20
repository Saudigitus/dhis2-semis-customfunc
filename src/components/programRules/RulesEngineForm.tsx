import { Form } from "react-final-form";
import { fields } from "../../utils/constants/fields";
import { WithPadding, GroupForm } from "dhis2-semis-components";
import React, { Fragment, useEffect, useState, useRef } from 'react';
import { RulesType } from "../../types/programRules/RulesEngineProps";
import { RulesEngine } from '../../hooks/programRules/rules-engine/RulesEngine';

export const RulesEngineForm = (props: any) => {
    const { } = props;
    const [values, setValues] = useState<Record<string, string>>({})
    const formRef: React.RefObject<FormApi<IForm, Partial<IForm>>> = useRef(null);
    const { runRulesEngine, updatedVariables } = RulesEngine({ variables: fields, values, type: RulesType.ProgramStageSection, onError: (error) => console.log(error) })

    useEffect(() => {
        runRulesEngine(fields)
    }, [values])

    function onSubmit() { }

    function onChange(e: any): void {
        setValues(e)
    }

    return (
        <Fragment>
            <WithPadding>
                <Form initialValues={{}} onSubmit={onSubmit}>
                    {({ handleSubmit, values, form }) => {
                        formRef.current = form;
                        return <form
                            onSubmit={handleSubmit}
                            onChange={onChange(values) as unknown as () => void}
                        >
                            {
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
                            }
                        </form>
                    }}
                </Form>
            </WithPadding >
        </Fragment>
    )
}