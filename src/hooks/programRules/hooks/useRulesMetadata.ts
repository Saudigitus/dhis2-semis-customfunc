import { useDataEngine } from '@dhis2/app-runtime';
import { useEffect, useState } from 'react';
import { RecoilState, useSetRecoilState } from 'recoil';

/** Fetch fresh metadata per program set; ignore results from superseded requests. */
export function useRulesMetadata<T>(programs: string[], resource: string, fields: string, state: RecoilState<T[]>) {
    const engine = useDataEngine();
    const setData = useSetRecoilState(state);
    const programIds = [...new Set(programs.flatMap(p => p.split(',')).filter(Boolean))].sort().join(',');
    const [status, setStatus] = useState({ key: '', loading: true, error: false });
    const [revision, setRevision] = useState(0);
    useEffect(() => {
        let active = true;
        setData([]);
        setStatus({ key: programIds, loading: true, error: false });
        if (!programIds) {
            setStatus({ key: programIds, loading: false, error: false });
            return;
        }
        engine.query({ results: { resource, params: { paging: false, fields, filter: `program.id:in:[${programIds}]` } } })
            .then(response => {
                if (!active) return;
                setData((response.results as Record<string, T[]>)[resource] ?? []);
                setStatus({ key: programIds, loading: false, error: false });
            }).catch(() => {
                if (active) setStatus({ key: programIds, loading: false, error: true });
            });
        return () => { active = false; };
    }, [engine, programIds, resource, fields, setData, revision]);
    return { loading: status.key !== programIds || status.loading, error: status.error,
        refetch: () => setRevision(value => value + 1) };
}
