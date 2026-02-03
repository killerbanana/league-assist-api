import { NextFunction, Request, Response } from "express";
import { BaseError } from "../exceptions/base-error";

export const errorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const json: any = {
    status: (<BaseError>err)?.httpCode || 500,
    message: "Internal Server Error",
    description: "Oops, something went wrong. Please try again later.",
  };

  if (
    (err as any).code == 9 &&
    (err as any).details.includes("The query requires an index")
  )
    json.description = (err as any).details;

  if (err instanceof BaseError) {
    json.message = err.message;
  }

  res.status(json.status).send(json);
};

const asyncWrapper = (fn: any) => {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next);
  };
};

export const errorHandlerWrapper = (fn: any) => {
  if (fn.constructor.name === "AsyncFunction") return asyncWrapper(fn);

  return fn;
};
