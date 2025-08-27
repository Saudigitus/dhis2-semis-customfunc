import { Form } from "react-final-form";
import { fields } from "../../utils/constants/fields";
import React, { Fragment, useEffect, useState } from 'react';
import { WithPadding, CustomForm } from "dhis2-semis-components";
import { CustomDhis2RulesEngine } from '../../hooks/programRules/rules-engine/RulesEngine';

export const RulesEngineForm = (props: any) => {
    const [values, setValues] = useState<Record<string, string>>({})
    const { runRulesEngine, updatedVariables } = CustomDhis2RulesEngine({ variables: fields, values, type: "programStageSection", program: "" })

    useEffect(() => {
        runRulesEngine()
    }, [values])

    function onSubmit() { }

    function onChange(e: any): void {
        setValues(e)
    }

    return (
        <Fragment>
            <WithPadding>
                <CustomForm
                    Form={Form}
                    // loading={loading}
                    withButtons={true}
                    formFields={updatedVariables}
                    setFormValues={onChange}
                    onInputChange={onChange}
                // initialValues={initialValues}
                // onCancel={() => { onCancel() }}
                // onFormSubtmit={(e) => { onSubmit(e) }}
                />
                {/* <Form initialValues={{}} onSubmit={onSubmit}>
                    {({ handleSubmit, values, form }) => {
                        formRef.current = form;
                        return <form
                            onSubmit={handleSubmit}
                            onChange={onChange(values) as unknown as () => void}
                        >
                            {
                                updatedVariables?.map((field: any, index: number) => {
                                    return (
                                        <CustomForm
                                            key={index}
                                            // name={field.section}
                                            formFields={field.fields}
                                        // ={field.description}
                                        />
                                    )
                                })
                            }
                        </form>
                    }}
                </Form> */}
            </WithPadding >
        </Fragment>
    )
}