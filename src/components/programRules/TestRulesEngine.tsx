import React from 'react'
import { RecoilRoot } from 'recoil'
import { RulesEngineForm } from './RulesEngineForm'
import RulesEngineWrapper from '../../hooks/programRules/wrapper/RulesEngineWrapper'

const TestRulesEngine = () => (
    <RecoilRoot>
        <RulesEngineWrapper programs={['wQaiD2V27Dp', 'wQaiD2V27Dp']}>
            <RulesEngineForm />
        </RulesEngineWrapper>
    </RecoilRoot>
)

export default TestRulesEngine