import { type Attribute } from '../generated/models';

export enum VariablesTypes {
    DataElement = "dataElement",
    Attribute = "attribute",
    Custom = "custom",
    Default = "default",
}

export interface CustomAttributeProps {
    id: string
    rawId?:string
    displayName: string
    header: string
    required: boolean
    name: string
    programStage?: string
    assignedValue?: string
    value?: string
    labelName: string
    valueType: typeof Attribute.valueType
    disabled: boolean
    visible: boolean
    options: {
        optionSet: {
            id: string
            options: OptionsProps[]
        }
    }
    error?: boolean
    warning?:boolean
    key?: any
    description?: string
    displayInFilters?: boolean
    type: VariablesTypes
    trackedEntity?: string
    placeholder?: string
    unique?: boolean
    initialOptions: {
        optionSet: {
            id: string
            options: OptionsProps[]
        }
    }
    content?: string
    pattern?: string
}

export interface OptionsProps {
    value: string
    label: string
}

