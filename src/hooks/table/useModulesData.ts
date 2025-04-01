import { useDataEngine } from "@dhis2/app-runtime";
import { EventQueryProps, EventQueryResults } from "../../types/events/eventsProps";
import { TeiQueryProps, TeiQueryResults } from "../../types/tei/teiProps";
import { GetTableDataProps } from "../../types/table/tableDataProps";
import { formatRowsData } from "../../utils/table/rows/formatRowsData";
import { FormatResponseRowsProps } from "../../types/common/FormatRowsDataProps";
import useShowAlerts from "../commons/useShowAlert";

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

    async function getRegistrationData(tableDataProps: GetTableDataProps) {
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters } = tableDataProps;

        const eventsResults = await engine.query(EVENT_QUERY({
            ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
            page,
            pageSize,
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

        const registrationTrackedEntities = eventsResults?.results?.instances?.map((x: { trackedEntity: string }) => x.trackedEntity) ?? []

        return { registrationEvents: eventsResults?.results?.instances as unknown as FormatResponseRowsProps['registrationInstances'], registrationTrackedEntities };
    }

    async function getTEIData(tableDataProps: GetTableDataProps, trackedEntity: string) {
        const { pageSize, program, orgUnit } = tableDataProps;

        const teiResults = trackedEntity?.length
            ? await engine.query(TEI_QUERY({
                ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                pageSize,
                program: program as unknown as string,
                trackedEntity
            })).catch((error) => {
                show({
                    message: `${("Could not get traked entities")}: ${error.message}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
            }) as unknown as TeiQueryResults
            : { results: { instances: [] } } as unknown as TeiQueryResults


        return teiResults?.results?.instances as unknown as FormatResponseRowsProps['teiInstances']
    }

    async function getBasicData(tableDataProps: GetTableDataProps) {
        const { page, pageSize, order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters } = tableDataProps;

        const eventsResults: any = await engine.query(EVENT_QUERY({
            ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
            page,
            pageSize,
            program: program as unknown as string,
            order: order || "occurredAt:desc",
            programStage: baseProgramStage,
            filter: dataElementFilters,
            filterAttributes: attributeFilters,
            orgUnit: orgUnit,
            totalPages: true,
        })).catch((error) => {
            show({
                message: `${("Could not get events")}: ${error.message}`,
                type: { critical: true }
            });
            setTimeout(hide, 5000);
        }) as unknown as EventQueryResults;

        const registrationTrackedEntities = eventsResults?.results?.instances.map((x: { trackedEntity: string }) => x.trackedEntity).toString().replaceAll(",", ";")

        const teiResults = registrationTrackedEntities?.length > 0
            ? await engine.query(TEI_QUERY({
                ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                skipPaging: true,
                program: program as unknown as string,
                trackedEntity: registrationTrackedEntities
            })).catch((error) => {
                show({
                    message: `${("Could not get traked entities")}: ${error.message}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
            }) as unknown as TeiQueryResults
            : { results: { instances: [] } } as unknown as TeiQueryResults

        const registrationInstances = eventsResults?.results?.instances as unknown as FormatResponseRowsProps['registrationInstances'];
        const teiInstances = teiResults?.results?.instances as unknown as FormatResponseRowsProps['teiInstances'];

        return {
            registrationInstances,
            teiInstances,
            formattedBasicTableData: formatRowsData({ registrationInstances, teiInstances }),
            pagination: {
                page: eventsResults?.results?.page,
                pageSize: eventsResults?.results?.pageSize,
                totalPages: eventsResults?.results?.pageCount,
                totalElements: eventsResults?.results?.total
            }
        }
    }

    async function getStageData({ tableDataProps, formattedBasicTableData }: { tableDataProps: GetTableDataProps, formattedBasicTableData: any }) {
        const {order, program, orgUnit, baseProgramStage, attributeFilters, dataElementFilters } = tableDataProps;
        let copy = []

        for (let i = 0; i < formattedBasicTableData.length; i++) {
            const eventsResults = await engine.query(EVENT_QUERY({
                ouMode: orgUnit != null ? "SELECTED" : "ACCESSIBLE",
                program: program as unknown as string,
                order: order || "occurredAt:desc",
                programStage: baseProgramStage,
                orgUnit: orgUnit,
                trackedEntity: formattedBasicTableData[i].trackedEntity
            })).catch((error) => {
                show({
                    message: `${("Could not get events")}: ${error.message}`,
                    type: { critical: true }
                });
                setTimeout(hide, 5000);
            }) as unknown as EventQueryResults;
            const frEvents = eventsResults?.results?.instances.filter((x: any) => x.enrollment === formattedBasicTableData[i].enrollmentId) as unknown as any || []

            copy[i] = { ...formatRowsData({ registrationInstances: frEvents ?? [], teiInstances: [] })[0], ...formattedBasicTableData[i], frEvent: eventsResults?.results?.instances?.[0] ?? {} }
        }

        return {
            formattedStagedData: copy
        }
    }

    return {
        getRegistrationData,
        getTEIData,
        getBasicData,
        getStageData
        //getAttendanceData
    }
}
