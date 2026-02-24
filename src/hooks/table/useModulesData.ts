import { useDataEngine } from "@dhis2/app-runtime";
import { EventQueryProps, EventQueryResults } from "../../types/events/eventsProps";
import { TeiQueryProps, TeiQueryResults } from "../../types/tei/teiProps";
import { GetTableDataProps } from "../../types/table/tableDataProps";
import { attendanceDataValuesFormater, formatRowsData } from "../../utils/table/rows/formatRowsData";
import { FormatResponseRowsProps } from "../../types/common/FormatRowsDataProps";
import useShowAlerts from "../commons/useShowAlert";
import { Modules } from "dhis2-semis-types";
import { useRef } from "react";
import { RequestBroker } from "../requestBroker/requestBroker";

export const EVENT_QUERY = (queryProps: EventQueryProps) => ({
    results: {
        resource: "tracker/events",
        params: {
            fields: queryProps?.fields ?? "*",
            ...queryProps
        }
    }
})

export const TEI_QUERY = (queryProps: TeiQueryProps) => ({
    results: {
        resource: "tracker/trackedEntities",
        params: {
            fields: "trackedEntity,createdAt,orgUnit,attributes[attribute,value],enrollments[enrollment,orgUnit,program,status],programOwners[orgUnit]",
            ...queryProps
        }
    }
})

export function useModulesData() {
    const engine = useDataEngine();
    const { hide, show } = useShowAlerts()
    const requestRef = useRef<any[]>([]);
    const { cancelAllOperations, makeCancellablePromise } = RequestBroker({ requestRef })

    async function getRegistrationData(tableDataProps: GetTableDataProps) {
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters, paging, skipPaging } = tableDataProps;

        const eventsResults = await engine.query(EVENT_QUERY({
            ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
            page,
            pageSize,
            ...(paging ? { paging } : {}),
            ...(skipPaging ? { skipPaging } : {}),
            program: program as unknown as string,
            order: order || "occurredAt:desc",
            programStage: baseProgramStage,
            filter: dataElementFilters,
            filterAttributes: attributeFilters,
            orgUnit: orgUnit
        })).catch((error) => {
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
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters, paging, skipPaging } = tableDataProps;

        const eventsResults = makeCancellablePromise(
            engine.query(EVENT_QUERY({
                ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                page,
                pageSize,
                ...(paging ? { paging } : {}),
                ...(skipPaging ? { skipPaging } : {}),
                program: program as unknown as string,
                order: order || "occurredAt:desc",
                programStage: baseProgramStage,
                filter: dataElementFilters,
                filterAttributes: attributeFilters,
                orgUnit: orgUnit,
                ...(skipPaging ? {} : { totalPages: true })
            }))
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
        const data = eventsResultsResponse?.results?.instances ? eventsResultsResponse?.results?.instances : eventsResultsResponse?.results?.events ?? []

        const registrationTrackedEntities = data.map((x: { trackedEntity: string }) => x.trackedEntity).toString().replaceAll(",", ";")

        const teiResults = registrationTrackedEntities?.length > 0
            && makeCancellablePromise(
                engine.query(TEI_QUERY({
                    ouMode: orgUnit != null ? "ACCESSIBLE" : "ACCESSIBLE",
                    skipPaging: true,
                    paging: false,
                    program: program as unknown as string,
                    trackedEntity: registrationTrackedEntities,
                    // orgUnit
                })).catch((error) => {
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

        const stageRequests = formattedBasicTableData.map((row: any) => {
            const cancelable = makeCancellablePromise(
                engine.query(EVENT_QUERY({
                    ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                    program: program as unknown as string,
                    order: order || "occurredAt:desc",
                    programStage: baseProgramStage!,
                    orgUnit: orgUnit,
                    trackedEntity: row.trackedEntity,
                    ...(occurredAfter ? { occurredAfter: occurredAfter } : {}),
                    ...(occurredBefore ? { occurredBefore: occurredBefore } : {})
                })).catch((error) => {
                    show({
                        message: `${("Could not get events")}: ${error.message}`,
                        type: { critical: true }
                    });
                    setTimeout(hide, 5000);
                })
            )

            requestRef.current.push(cancelable);
            return cancelable as unknown as Promise<EventQueryResults>;
        });

        const stageResponses = await Promise.all(stageRequests);

        for (let i = 0; i < formattedBasicTableData.length; i++) {
            const eventsResults = stageResponses[i] as unknown as EventQueryResults;
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
