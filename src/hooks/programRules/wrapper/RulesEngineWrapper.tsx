import React, { Fragment, useEffect } from 'react'
import { Center, CircularLoader } from "@dhis2/ui";
import FetchEngineVariables from './FetchEngineVariables';
import { initializeRulesEngine } from '../rules-engine/InitializeRulesEngine';
import { RulesEngineWrapperProps } from '../../../types/programRules/RulesEngineProps';

/**
 * A component to initialize all required variables to run program rules.
 *
 * @export
 * @param {RulesEngineWrapperProps} props - The wrapper properties.
 * @returns {*} A JSX component which renders circular loader, error messages or wrapper children based whith the initializer status.
 */
export default function RulesEngineWrapper(props: RulesEngineWrapperProps) {
    const { programs } = props;
    const { initialize } = initializeRulesEngine()
    const { loading, error } = FetchEngineVariables(programs)

    useEffect(() => {
        initialize()
    }, [loading, error])

    if (loading) {
        return (
            <Center>
                <CircularLoader />
            </Center>
        )
    }

    if (error) {
        return (
            <Center>
                Something went wrong wen loading the app program rules, please check if you app is already configured.
            </Center>
        )
    }

    return (
        <Fragment>
            {props.children}
        </Fragment>
    )
}