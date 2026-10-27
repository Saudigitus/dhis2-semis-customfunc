import { transformQueryParams } from "./tranformParams"
import { EventQueryProps } from "../../types/api/WithoutRegistrationTypes"

type MapRule = {
  to: string
  transform?: (value: any) => any
}

export const rules: Record<string, MapRule> = {
  trackedEntities: {
    to: "trackedEntity",
    transform: (v: string) => v.replaceAll(",", ";"),
  },

  // events: {
  //     to: "event",
  //     transform: (v: string) => v.replaceAll(",", ";"),
  // },

  orgUnitMode: {
    to: "ouMode",
  },

  // orgUnits: {
  //     to: "ou",
  //     transform: (v: string) => v.replaceAll(",", ";"),
  // },

  // enrollments: {
  //     to: "enrollment",
  //     transform: (v: string) => v.replaceAll(",", ";"),
  // },

  paging: {
    to: "skipPaging",
    transform: (v: boolean) => !v,
  },

  enrollmentStatus: {
    to: "programStatus",
  },
}


export const convertEventQueryProps = ({ queryProps, apiVersion }
  : { queryProps: EventQueryProps, apiVersion: any }): EventQueryProps => {
  const minorVersion = Number.parseInt(String(apiVersion ?? "").split('.')[1])

  // Before 2.41 only the old names exist. ouMode and skipPaging are ignored by 2.42 and 2.43,
  // so lists are cut at 50 records and the org unit mode is lost (SEMIS-198).
  if (minorVersion < 41)
    return { ...transformQueryParams({ rules, params: queryProps }) as EventQueryProps }

  // From 2.41 the events endpoint still takes a single trackedEntity, not a trackedEntities list, and
  // programStatus: 2.41.4.2 ignores enrollmentStatus, while 2.43 accepts both.
  return { ...transformQueryParams({ rules: { trackedEntities: rules.trackedEntities, enrollmentStatus: rules.enrollmentStatus }, params: queryProps }) as EventQueryProps }
}
