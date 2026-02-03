import { HttpStatusCode } from "src/core/enums/Http-status-code";

export class BaseError extends Error {
  public readonly description: string;
  public readonly methodName: string;
  public readonly httpCode: HttpStatusCode;
  public readonly isOperational: boolean;

  constructor(
    description: string,
    message: string | unknown = description,
    methodName: string = "",
    httpCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    isOperational = true
  ) {
    super(<string>message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.description = description;

    this.methodName = methodName;

    this.httpCode = httpCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}
