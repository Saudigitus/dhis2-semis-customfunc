export function importSummary(summary: any, updatedStats: any) {
    return {
        ...updatedStats,
        stats: {
            created: updatedStats.stats.created + (summary.stats.created || 0),
            ignored: updatedStats.stats.ignored + (summary.stats.ignored || 0),
            updated: updatedStats.stats.updated + (summary.stats.updated || 0),
            total: updatedStats.stats.total + (summary.stats.updated || 0),
        },
        errorDetails: [
            ...(updatedStats.errorDetails || []),
            ...(summary.validationReport?.errorReports || []),
        ],
    };
}