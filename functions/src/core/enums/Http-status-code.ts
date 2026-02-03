export enum HttpStatusCode {
  /**
   * Standard response for successful HTTP requests.
   */
  OK = 200,

  /**
   * The request has been fulfilled, resulting in the creation of a new resource.
   */
  CREATED = 201,

  /**
   * The request has been accepted for processing, but the processing has not been completed.
   */
  ACCEPTED = 202,

  /**
   * The server successfully processed the request and is not returning any content.
   */
  NO_CONTENT = 204,

  /**
   * The server successfully processed the request, but is not returning any content.
   * Used here to indicate the client should refresh the token after custom claims were set.
   */
  RESET_CONTENT = 205,

  /**
   * The server cannot or will not process the request due to something that is perceived to be a client error.
   */
  BAD_REQUEST = 400,

  /**
   * The client must authenticate itself to get the requested response.
   */
  UNAUTHORIZED = 401,

  /**
   * The client does not have access rights to the content.
   */
  FORBIDDEN = 403,

  /**
   * The server can not find the requested resource.
   */
  NOT_FOUND = 404,

  /**
   * The request could not be completed due to a conflict with the current state of the resource.
   */
  CONFLICT = 409,

  /**
   * The server has encountered a situation it doesn't know how to handle.
   */
  INTERNAL_SERVER_ERROR = 500,

  /**
   * The server, while acting as a gateway or proxy, did not get a response in time.
   */
  GATEWAY_TIMEOUT = 504,
  UNPROCESSABLE_ENTITY,
}
