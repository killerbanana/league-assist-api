type RouteItem = {
  path: string;
  controller: (
    req: import("express").Request,
    res: import("express").Response
  ) => void;
  method: string;
  middlewares: Array<
    (
      req: import("express").Request,
      res: import("express").Response,
      next: import("express").NextFunction
    ) => void
  >;
  validators: Array<
    (
      req: import("express").Request,
      res: import("express").Response,
      next: import("express").NextFunction
    ) => void
  >;
  filename: string;
};

type RoutesItem = {
  items: Array<object>;
  middlewares: Array<
    (
      req: import("express").Request,
      res: import("express").Response,
      next: import("express").NextFunction
    ) => void
  >;
  validators: Array<
    (
      req: import("express").Request,
      res: import("express").Response,
      next: import("express").NextFunction
    ) => void
  >;
  prefix: string;
  namespace: string;
};

type SysDate = {
  created: Date;
  updated: Date;
};

declare namespace Express {
  export interface Response {
    created: any;
    deleted: any;
    success: any;
    updated: any;
    patched: any;
  }
}
