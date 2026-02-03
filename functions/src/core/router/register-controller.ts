import { Router } from "express";

export = (
  router: Router,
  item: RouteItem,
  namespace: string,
  errorHandler: any
) => {
  switch (item.method) {
    case "get":
      router.get(item.path, errorHandler(item.controller));
      break;
    case "post":
      router.post(item.path, errorHandler(item.controller));
      break;
    case "put":
      router.put(item.path, errorHandler(item.controller));
      break;
    case "patch":
      router.patch(item.path, errorHandler(item.controller));
      break;
    case "delete":
      router.delete(item.path, errorHandler(item.controller));
      break;
    default:
      throw Error("[ROUTER] No Router method matched!");
  }
};
