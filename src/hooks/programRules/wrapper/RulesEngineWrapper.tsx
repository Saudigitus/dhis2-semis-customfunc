import React, { Fragment, useEffect } from 'react'
import FetchEngineVariables from './FetchEngineVariables';
import { Center, CircularLoader } from "@dhis2/ui";
import { initializeRulesEngine } from '../rules-engine/InitializeRulesEngine';
import { RulesEngineWrapperProps } from '../../../types/programRules/RulesEngineProps';

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