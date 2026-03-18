/** HTTP status codes used by the API (avoid magic numbers). */
export const HttpStatusCode = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCodeValue = (typeof HttpStatusCode)[keyof typeof HttpStatusCode];
