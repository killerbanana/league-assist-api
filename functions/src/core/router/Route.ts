import * as express from "express";
import { Application, NextFunction, Request, Response } from "express";
import App from "../App";
import { errorHandlerWrapper } from "../middlewares/error-handler";
import registerControllers from "./register-controller";
import registerMiddlewares from "./register-middlewares";
import registerValidators from "./register-validator";
import { versions } from "../api/routes";

const _routes: Array<RoutesItem> = [];

export class Route {
  key: number = 0;
  items: Array<RouteItem> = [];
  methods: Array<string> = [];
  midwareFlag: string = "";
  middleswares: Array<(req: Request, res: Response, next: NextFunction) => void> = [];

  constructor() {
    this.key = _routes.length;
  }

  static registerAll() {
    const app: Application = App.getInstance();

    for (const version in versions) {
      const versionRouter = express.Router();

      versions[version as keyof typeof versions]();

      for (const route of _routes) {
        const routeGroupRouter = express.Router();

        for (const item of route.items) {
          registerMiddlewares(routeGroupRouter, <RouteItem>item);
          registerValidators(routeGroupRouter, <RouteItem>item, errorHandlerWrapper);
          registerControllers(routeGroupRouter, <RouteItem>item, route.namespace, errorHandlerWrapper);
        }

        versionRouter.use(route.prefix || "/", routeGroupRouter);
      }

      app.use("/", versionRouter);

      _routes.length = 0;
    }
  }

  register(path: string, controller: (req: Request, res: Response) => void, method: string, filename: string) {
    const routeItem: RouteItem = {
      path,
      controller,
      method,
      middlewares: [],
      validators: [],
      filename,
    };
    this.items.push(routeItem);

    const RoutesItem: RoutesItem = {
      items: [],
      middlewares: [],
      validators: [],
      prefix: "",
      namespace: "",
    };

    _routes[this.key] = RoutesItem;
    _routes[this.key].items = this.items;

    this.midwareFlag = "items";
  }

  get(path: string, controller: (req: Request, res: Response) => void, filename: string) {
    this.register(path, controller, "get", filename);
    return this;
  }

  post(path: string, controller: (req: Request, res: Response) => void, filename: string) {
    this.register(path, controller, "post", filename);
    return this;
  }

  put(path: string, controller: (req: Request, res: Response) => void, filename: string) {
    this.register(path, controller, "put", filename);
    return this;
  }

  patch(path: string, controller: (req: Request, res: Response) => void, filename: string) {
    this.register(path, controller, "patch", filename);
    return this;
  }

  delete(path: string, controller: (req: Request, res: Response) => void, filename: string) {
    this.register(path, controller, "delete", filename);
    return this;
  }

  group(callback: () => void) {
    callback();
    return this;
  }

  middleware(midwares: Array<(req: Request, res: Response, next: NextFunction) => void>) {
    if (this.midwareFlag === "items") {
      const currRoute: RouteItem = this.items.pop()!;

      if (!currRoute) {
        throw Error("[ERROR] ROUTER ERR0131 No Route Item selected!");
      }

      currRoute.middlewares = midwares;
      this.items.push(currRoute);
      _routes[this.key].items = this.items;
    } else {
      this.middleswares.push.apply(midwares);
      _routes[this.key].middlewares = this.middleswares;
    }

    return this;
  }

  validator(validators: Array<(req: Request, res: Response, next: NextFunction) => void>) {
    const currRoute: RouteItem = this.items.pop()!;

    if (!currRoute) {
      throw Error("[ERROR] ROUTER ERR0131 No Route Item selected!");
    }

    currRoute.validators = validators;
    this.items.push(currRoute);
    _routes[this.key].items = this.items;
  }

  prefix(pref: string) {
    _routes[this.key].prefix = pref;
    return this;
  }

  namespace(namsp: string) {
    _routes[this.key].namespace = namsp;
    return this;
  }
}
