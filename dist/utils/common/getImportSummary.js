export function importSummary(summary, updatedStats) {
    var _a;
    return Object.assign(Object.assign({}, updatedStats), { stats: {
            created: updatedStats.stats.created + (summary.stats.created || 0),
            ignored: updatedStats.stats.ignored + (summary.stats.ignored || 0),
            updated: updatedStats.stats.updated + (summary.stats.updated || 0),
            total: updatedStats.stats.total + (summary.stats.updated || 0),
        }, errorDetails: [
            ...(updatedStats.errorDetails || []),
            ...(((_a = summary.validationReport) === null || _a === void 0 ? void 0 : _a.errorReports) || []),
        ] });
}
