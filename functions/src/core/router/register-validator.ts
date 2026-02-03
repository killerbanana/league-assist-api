import { NextFunction, Request, Response, Router } from "express";

export = (router: Router, item: RouteItem, errorHandler: any) => {
  if (item.validators) {
    item.validators.map((validator: (req: Request, res: Response, next: NextFunction) => void) => {
      switch (item.method) {
        case "get":
          router.get(item.path, errorHandler(validator));
          break;
        case "post":
          router.post(item.path, errorHandler(validator));
          break;
        case "put":
          router.put(item.path, errorHandler(validator));
          break;
        case "patch":
          router.patch(item.path, errorHandler(validator));
          break;
        case "delete":
          router.delete(item.path, errorHandler(validator));
          break;
        default:
          throw Error("[ROUTER] No Router method matched!");
      }
    });
  }
};
