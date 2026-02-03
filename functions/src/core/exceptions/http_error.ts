export class HttpError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "Resource not found.") {
    super(404, message);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = "You do not have permission to perform this action.") {
    super(403, message);
  }
}

export class ConflictError extends HttpError {
  constructor(message = "A conflict occurred.") {
    super(409, message);
  }
}

export class BadRequestError extends HttpError {
  constructor(message = "Bad request.") {
    super(400, message);
  }
}

export class InternalServerError extends HttpError {
  constructor(message = "Internal Server Error") {
    super(500, message);
  }
}

export class AuthorizationError extends HttpError {
  constructor(message = "Authorization failed.") {
    super(401, message);
  }
}
