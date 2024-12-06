import { useState } from 'react'
import { ExportData } from "../../types/bulk/bulkOperations";
import { isDateFormatValid } from "../../utils/format/checkDateFormat";
import { useGetEvents } from "../events/useGetEvents";
import { formatSheetData } from "../../utils/format/formatSheetData";
import { DataStoreRecord } from "../../types/dataStore/DataStoreConfig";
import { getMetaData } from '../../utils/excelMetadata/getMetadata';
import { generateHeaders } from './excelHeaders/generateExcelHeaders';
import { getCommonSheetData } from './useGetCommonData/commonData';
import { generateFile } from './dataExporter/fileGenerator';
import { modules } from '../../types/common/moduleTypes';
import { generateEmptyRows } from '../../utils/common/generateData';
import { generateAndReserveIds } from './generateIds/generateAndReserve';

export function useExportData(props: ExportData) {
    const [error, setError] = useState<any>(null)
    const { getData } = getCommonSheetData(props)
    const { getEvents, error: eventsError } = useGetEvents()
    const { generate } = generateAndReserveIds()
    const {
        numberOfEmptyRows = 25,
        programConfig,
        fileName,
        isSchoolDay,
        orgUnit,
        stagesToExport,
        module,
        endDate,
        startDate,
        selectedSectionDataStore = {} as unknown as DataStoreRecord,
        withSocioEconomics = false,
        sectionType,
        empty = false,
        orgUnitName
    } = props
    const { excelGenerator } = generateFile({ unavailableDays: isSchoolDay as unknown as (date: Date) => boolean })
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

    async function exportData() {

        if (module === modules.attendance &&
            (!isDateFormatValid(endDate as unknown as string)
                || !isDateFormatValid(startDate as unknown as string))
        ) {
            setError('The date format is not correct, the expected date format is: yyyy-MM-dd')
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
                                setError(error)
                            })
                        }
                    }
                }
            } else if (empty && module == modules.enrollment) {
                let ids: any = {}

                for (const idToGenerate of toGenerate) {
                    const generatedIds = await generate(numberOfEmptyRows, idToGenerate) as unknown as any
                    ids[idToGenerate] = generatedIds?.result?.map((x: any) => x.value)
                }

                data = generateEmptyRows(numberOfEmptyRows, formatedHeaders, ids, orgUnitName)
            } else {
                setError('empty só é aplicavel para o módulo do enrollment!')
            }

            await excelGenerator({ headers: formatedHeaders, rows: data, filters, fileName, metadata, module, empty, defaultLockedHeaders })
        }
    }

    return { exportData, error: error ?? eventsError }
}