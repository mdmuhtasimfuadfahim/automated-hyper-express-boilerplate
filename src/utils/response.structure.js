export const successResponse = (
  status,
  data,
  message,
  comment,
  traceCode,
  requestId,
) => ({
  status,
  data,
  message: [message],
  comment,
  traceCode,
  requestId,
});

export const errorResponse = (
  status,
  message,
  comment,
  traceCode,
  requestId,
) => ({
  status,
  message: [message],
  comment,
  traceCode,
  requestId,
});
