import { NextFunction, Request, Response, Router } from "express";

export = (router: Router, item: RouteItem) => {
  if (item.middlewares) {
    item.middlewares.map(
      (
        middleware: (req: Request, res: Response, next: NextFunction) => void
      ) => {
        switch (item.method) {
          case "get":
            router.get(item.path, middleware);
            break;
          case "post":
            router.post(item.path, middleware);
            break;
          case "put":
            router.put(item.path, middleware);
            break;
          case "patch":
            router.patch(item.path, middleware);
            break;
          case "delete":
            router.delete(item.path, middleware);
            break;
          default:
            throw Error("[ROUTER] No Router method matched!");
        }
      }
    );
  }
};
