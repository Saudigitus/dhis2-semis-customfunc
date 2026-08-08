import { transformQueryParams } from "./tranformParams"

type OwnershipTransferQueryProps = {
    program: string
    ou: string
    trackedEntityInstance: string
}

type MapRule = {
    to: string
    transform?: (value: any) => any
}

const commonRules: Record<string, MapRule> = {
    trackedEntityInstance: {
        to: "trackedEntity"
    }
}

const modernRules: Record<string, MapRule> = {
    ...commonRules
}

const legacyRules: Record<string, MapRule> = {
    ...commonRules,
    ou: {
        to: "orgUnit"
    }
}

function normalizeApiVersion(apiVersion: unknown): number | undefined {
    const version = Number(apiVersion)
    return Number.isFinite(version) ? version : undefined
}

function stringifyParams(params: Record<string, any>) {
    return JSON.stringify(
        Object.keys(params)
            .sort()
            .reduce((acc, key) => {
                acc[key] = params[key]
                return acc
            }, {} as Record<string, any>)
    )
}

function convertOwnershipTransferQueryProps({
    queryProps,
    apiVersion
}: {
    queryProps: OwnershipTransferQueryProps,
    apiVersion?: number | string
}) {
    const version = normalizeApiVersion(apiVersion)
    const useLegacyOrder = version !== undefined && version < 41
    const rules = useLegacyOrder ? legacyRules : modernRules

    return transformQueryParams({ rules, params: queryProps })
}

function getOwnershipTransferQueryPropsCandidates({
    queryProps,
    apiVersion
}: {
    queryProps: OwnershipTransferQueryProps,
    apiVersion?: number | string
}) {
    const preferred = convertOwnershipTransferQueryProps({ queryProps, apiVersion })
    const alternate = transformQueryParams({
        rules: preferred.orgUnit ? modernRules : legacyRules,
        params: queryProps
    })

    const seen = new Set<string>()

    return [preferred, alternate].filter((candidate) => {
        const key = stringifyParams(candidate)
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export {
    convertOwnershipTransferQueryProps,
    getOwnershipTransferQueryPropsCandidates
}

export type { OwnershipTransferQueryProps }
