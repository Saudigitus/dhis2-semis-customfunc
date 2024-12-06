import { DataStoreRecord } from "../dataStore/DataStoreConfig"
import { ProgramConfig } from "../programConfig/ProgramConfig"

/**
 * Description placeholder
 *
 * @interface ExportData
 * @typedef {ExportData}
 */
/**
 * Description placeholder
 *
 * @interface ExportData
 * @typedef {ExportData}
 */
interface ExportData {
    /**
     * Exported file name
     *
     * @type {string}
     */
    fileName: string

    /**
     * The id of the organisationa unit from which the data will be retrieved
     *
     * @type {string}
     */
    orgUnit: string

    /**
     * Array of program stages id to export data
     * 
     * @type {string[]}
     */
    stagesToExport: string[]

    /**
     * The array of filters applied to the headers (class and grid)
     *
     * @type {?any[]}
     */
    eventFilters?: any[]

    /**
     * The selected org unit name
     *
     * @type {string}
     */
    orgUnitName: string

    /**
     * The data of the socio-economics stge is not mandatory, if you want this data 
     * 
     * in your exported file you must set this variable to true. 
     * 
     * This does not apply to the enrollment module. In the enrollment module, the 
     * 
     * values for this stage will always be exported
     *
     * @type {?boolean}
     */
    withSocioEconomics?: boolean

    /**
     * selected section type name
     *
     * @type {string}
     */
    sectionType: string

    /**
     * Depending on the module, the data is exported with a focus on just one programme stage,
     * 
     * so this variable is intended to receive the name of the section that will contain this data.
     *
     * @type {?string}
     */
    module: "attendance" | "final-result" | "enrollment" | "performance",

    /**
     * if you want to export attendace data you need to set a date range, so, this variable will
     * 
     * get the start date in this formtat: yyyy-MM-dd
     *
     * @type {?string}
     */
    startDate?: string

    /**
     * if you want to export attendace data you need to set a date range, so, this variable will
     * 
     * get the end date in this formtat: yyyy-MM-dd
     *
     * @type {?string}
     */
    endDate?: string

    /**
     * Settings saved at data store
     *
     * @type {DataStoreRecord}
     */
    selectedSectionDataStore?: DataStoreRecord

    /**
    * Program configurations
    *
    * @type {ProgramConfig}
    */
    programConfig: ProgramConfig

    /**
    * function tha chekcs if the given date is school day or no
    *
    * @type {function}
    */
    isSchoolDay?: (date: Date) => boolean

    /**
     * Sometimes we may need a blank file to add new data, with just the structure and headers. 
     * 
     * So this variable is intended to tell us whether the file to be exported should be empty
     * 
     * or contain the events of the registered students.
     *
     * @type {?boolean}
     */
    empty?: boolean

    /**
     * Number of empty rows wich you want to export, default is 25
     *
     * @type {?boolean}
     */
    numberOfEmptyRows?: number
}

interface GenerateHeaders {
    stagesToExport: string[]
    selectedSectionDataStore: DataStoreRecord
    withSocioEconomics: boolean
    programConfig: ProgramConfig
    sectionType: string
    isSchoolDay?: (date: Date) => boolean
    startDate?: string
    endDate?: string
    module: string
    empty: boolean
}

interface excelProps {
    headers: any[]
    rows: any[]
    filters: any
    fileName: string
    metadata: any[]
    module: string
    empty: boolean
    defaultLockedHeaders: string[]
}


export enum importStrategy {
    CREATE = "CREATE_AND_UPDATE",
    UPDATE = "UPDATE"
}

interface importData {
    updating?: boolean
    excelData: {
        module: "attendance" | "final-result" | "enrollment" | "performance",
        mapping: []
    }
    importMode: "VALIDATE" | "COMMIT",
    programConfig: ProgramConfig
    sectionType: string
    selectedSectionDataStore: DataStoreRecord
    orgUnit?: string
}

export type { ExportData, GenerateHeaders, excelProps, importData }