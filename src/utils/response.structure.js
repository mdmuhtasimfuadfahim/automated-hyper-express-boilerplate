export const successResponse = (status, data, limitUsageStats, message, comment, traceCode, requestId) => ({
    status,
    data,
    message: [message],
    comment,
    traceCode,
    requestId,
});

export const errorResponse = (status, limitUsageStats, message, comment, traceCode, requestId) => ({
    status,
    message: [message],
    comment,
    traceCode,
    requestId,
});