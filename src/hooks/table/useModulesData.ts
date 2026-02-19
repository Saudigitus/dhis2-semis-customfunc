import { useRef } from "react";
import { Modules } from "dhis2-semis-types";
import { useDataEngine } from "@dhis2/app-runtime";
import useShowAlerts from "../commons/useShowAlert";
import { useGetEvents } from "../events/useGetEvents";
import { RequestBroker } from "../requestBroker/requestBroker";
import { GetTableDataProps } from "../../types/table/tableDataProps";
import { EventQueryResults } from "../../types/api/WithoutRegistrationTypes";
import { FormatResponseRowsProps } from "../../types/common/FormatRowsDataProps";
import { TeiQueryResults } from "../../types/api/WithRegistrationTypes";
import { attendanceDataValuesFormater, formatRowsData } from "../../utils/table/rows/formatRowsData";
import { useGetTrackers } from "../tei/useGetTei";



export function useModulesData() {
    const engine = useDataEngine();
    const { getEvents } = useGetEvents()
    const requestRef = useRef<any[]>([]);
    const { hide, show } = useShowAlerts()
    const { getTrackers } = useGetTrackers()
    const { cancelAllOperations, makeCancellablePromise } = RequestBroker({ requestRef })

    async function getRegistrationData(tableDataProps: GetTableDataProps) {
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters, paging } = tableDataProps;

        const eventsResults = await getEvents({
            orgUnitMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
            page,
            pageSize,
            ...(paging ? { paging } : {}),
            program: program as unknown as string,
            order: order || "occurredAt:desc",
            programStage: baseProgramStage,
            filter: dataElementFilters,
            filterAttributes: attributeFilters,
            orgUnit: orgUnit
        }).catch((error) => {
            show({
                message: `${("Could not get events")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
        }) as unknown as EventQueryResults;
        const data = eventsResults?.results?.instances ? eventsResults?.results?.instances : eventsResults?.results?.events
        const registrationTrackedEntities = data?.map((x: { trackedEntity: string }) => x.trackedEntity) ?? []

        return { registrationEvents: data as unknown as FormatResponseRowsProps['registrationInstances'], registrationTrackedEntities };
    }

    async function getBasicData(tableDataProps: GetTableDataProps) {
        cancelAllOperations()
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters, paging } = tableDataProps;

        const eventsResults = makeCancellablePromise(
            getEvents({
                orgUnitMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                page,
                pageSize,
                ...(paging ? { paging } : {}),
                program: program as unknown as string,
                order: order || "occurredAt:desc",
                programStage: baseProgramStage,
                filter: dataElementFilters,
                filterAttributes: attributeFilters,
                orgUnit: orgUnit,
                totalPages: true
            })
                .catch((error) => {
                    show({
                        message: `${("Could not get events")}: ${error.message}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                })
        )

        requestRef.current.push(eventsResults);
        const eventsResultsResponse = await eventsResults
        const data = eventsResultsResponse?.results?.instances ? eventsResultsResponse?.results?.instances : eventsResultsResponse?.results?.events

        const registrationTrackedEntities = data.map((x: { trackedEntity: string }) => x.trackedEntity).toString().replaceAll(",", ";")

        const teiResults = registrationTrackedEntities?.length > 0
            && makeCancellablePromise(
                getTrackers({
                    orgUnitMode: orgUnit != null ? "ACCESSIBLE" : "ACCESSIBLE",
                    paging: false,
                    program: program as unknown as string,
                    trackedEntities: registrationTrackedEntities,
                    // orgUnit
                }).catch((error) => {
                    show({
                        message: `${("Could not get traked entities")}: ${error.message}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                })
            )

        requestRef.current.push(teiResults);
        const teiResultsResponse = registrationTrackedEntities?.length > 0 ? await teiResults : { results: { instances: [], trackedEntities: [] } } as unknown as TeiQueryResults
        const teis = teiResultsResponse?.results?.instances ? teiResultsResponse?.results?.instances : teiResultsResponse?.results?.trackedEntities

        const registrationInstances = data as unknown as FormatResponseRowsProps['registrationInstances'];
        const teiInstances = teis as unknown as FormatResponseRowsProps['teiInstances'];

        return {
            registrationInstances,
            teiInstances,
            formattedBasicTableData: formatRowsData({ registrationInstances, teiInstances, isBasicStage: true }),
            pagination: {
                page: eventsResultsResponse?.results?.page,
                pageSize: eventsResultsResponse?.results?.pageSize,
                totalPages: eventsResultsResponse?.results?.pageCount,
                totalElements: eventsResultsResponse?.results?.total
            }
        }
    }

    async function getStageData({ tableDataProps, formattedBasicTableData, module }: { tableDataProps: GetTableDataProps, formattedBasicTableData: any, module?: Modules }) {
        const { order, program, orgUnit, baseProgramStage, occurredAfter, occurredBefore, attendanceConfig } = tableDataProps;
        let copy = []

        for (let i = 0; i < formattedBasicTableData.length; i++) {
            const cancelable = makeCancellablePromise(
                getEvents({
                    orgUnitMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                    program: program as unknown as string,
                    order: order || "occurredAt:desc",
                    programStage: baseProgramStage!,
                    orgUnit: orgUnit,
                    trackedEntities: formattedBasicTableData[i].trackedEntity,
                    ...(occurredAfter ? { occurredAfter: occurredAfter } : {}),
                    ...(occurredBefore ? { occurredBefore: occurredBefore } : {})
                }).catch((error) => {
                    show({
                        message: `${("Could not get events")}: ${error.message}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                })
            )

            const eventsResults = await cancelable as unknown as EventQueryResults;
            requestRef.current.push(cancelable);
            const data = eventsResults?.results?.instances ? eventsResults?.results?.instances : eventsResults?.results?.events ?? []
            const filteredEvents = data.filter((x: any) => x.enrollment === formattedBasicTableData[i].enrollmentId) as unknown as any || []

            copy[i] = {
                ...(Modules.Attendance == module ?
                    attendanceDataValuesFormater(filteredEvents, attendanceConfig as unknown as any)
                    : formatRowsData({ registrationInstances: filteredEvents ?? [], teiInstances: [], isBasicStage: false })[0]),
                ...formattedBasicTableData[i], ...(Modules.Final_Result == module ? { frEvent: filteredEvents[0] ?? {} } : {})
            }
        }

        return {
            formattedStagedData: copy
        }
    }

    return {
        getRegistrationData,
        getBasicData,
        getStageData
    }
}
