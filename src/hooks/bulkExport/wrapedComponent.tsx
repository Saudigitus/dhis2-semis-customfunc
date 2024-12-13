import { ExportData } from "../../types/bulk/bulkOperations"
import { DataProvider } from '@dhis2/app-runtime';
import { generateHeaders } from "./excelHeaders/generateExcelHeaders";
import useShowAlerts from "../commons/useShowAlert";
import { getCommonSheetData } from "./useGetCommonData/commonData";
import { useGetEvents } from "../events/useGetEvents";
import { areParamsValid } from "../../utils/common/validateRequiredParams";
import { generateEmptyRows } from "../../utils/common/generateData";
import { formatSheetData } from "../../utils/format/formatSheetData";
import { modules } from "../../types/common/moduleTypes";
import { getMetaData } from "../../utils/excelMetadata/getMetadata";
import { DataStoreRecord } from "../../types/dataStore/DataStoreConfig";
import { generateAndReserveIds } from "./generateIds/generateAndReserve";
import { generateFile } from "./dataExporter/fileGenerator";

export default function DataExporter(props: ExportData) {
    const {
        label,
        numberOfEmptyRows = 25,
        programConfig,
        fileName,
        isSchoolDay,
        orgUnit,
        stagesToExport,
        module,
        endDate,
        startDate,
        selectedSectionDataStore,
        withSocioEconomics = false,
        sectionType,
        empty = false,
        orgUnitName
    } = props
    const { getHeaders } = generateHeaders({
        module,
        programConfig,
        stagesToExport,
        selectedSectionDataStore,
        sectionType,
        withSocioEconomics,
        endDate,
        startDate,
        empty
    })
    const { hide, show } = useShowAlerts()
    const { getData } = getCommonSheetData(props)
    const { getEvents } = useGetEvents()
    const { msg, valid } = areParamsValid({ ...props })
    const { generate } = generateAndReserveIds()
    const { excelGenerator } = generateFile({ unavailableDays: isSchoolDay as unknown as (date: Date) => boolean })

    return (
        <DataProvider baseUrl='http://localhost:8080'>
            <a style={{ width: "100%", cursor: "pointer", padding: "5px" }} onClick={async (e) => {
                e.preventDefault()
                if (!valid) {
                    show({ message: `Export error: ${msg}`, type: { critical: true } })
                    setTimeout(hide, 5000);
                } else {
                    if (empty && module != modules.enrollment) {
                        show({ message: `Export error: The empty variable only applies to the enrollment module!`, type: { critical: true } })
                        setTimeout(hide, 5000);
                    } else {

                        let data: any = []
                        const { filters, formatedHeaders, toGenerate, defaultLockedHeaders } = getHeaders()
                        const metadata = getMetaData(programConfig, stagesToExport)

                        if (!empty) {
                            data = await getData()

                            if (module != modules.enrollment) {
                                for (let teisCounter = 0; teisCounter < data.length; teisCounter++) {
                                    for (let a = 0; a < stagesToExport.length; a++) {
                                        await getEvents({
                                            program: selectedSectionDataStore?.program as unknown as string,
                                            ...(module === modules.attendance ? {
                                                occurredAfter: startDate,
                                                occurredBefore: endDate
                                            } : {}),
                                            orgUnit,
                                            ouMode: "SELECTED",
                                            programStage: stagesToExport[a],
                                            fields: "event,trackedEntity,occurredAt,enrollment,dataValues[dataElement,value]",
                                            trackedEntity: data[teisCounter].trackedEntity,
                                            skipPaging: true
                                        }).then((resp) => {

                                            const events = resp?.filter((x: any) => x.enrollment === data[teisCounter].enrollment)

                                            data[teisCounter] = {
                                                ...data[teisCounter], ...formatSheetData({
                                                    module: module,
                                                    stageId: stagesToExport[a],
                                                    events: events,
                                                    dataStore: selectedSectionDataStore as unknown as DataStoreRecord
                                                })
                                            }
                                        }).catch((error) => {
                                            show({ message: `Export error: Occurred error wihile fetching data: ${error}`, type: { critical: true } })
                                            setTimeout(hide, 5000);
                                        })
                                    }
                                }
                            } else if (empty && module == modules.enrollment) {
                                let ids: any = {}

                                for (const idToGenerate of toGenerate) {
                                    const generatedIds = await generate(numberOfEmptyRows, idToGenerate) as unknown as any
                                    ids[idToGenerate] = generatedIds?.result?.map((x: any) => x.value)
                                }

                                data = generateEmptyRows(numberOfEmptyRows, formatedHeaders, ids, orgUnitName)
                            }

                            try {
                                await excelGenerator({ headers: formatedHeaders, rows: data, filters, fileName, metadata, module, empty, defaultLockedHeaders })
                            } catch (error) {
                                show({ message: `Export error: Occurred an error while generating file!`, type: { critical: true } })
                                setTimeout(hide, 5000);
                            }
                        }
                    }
                }
            }} >
                {label}
            </a>
        </DataProvider>
    )
}