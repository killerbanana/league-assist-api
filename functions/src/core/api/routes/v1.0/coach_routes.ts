import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import CoachController from "../../app-configs/controllers/v1.0/coach_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route.post("/", CoachController.create, "create");
      route.patch("/:id", CoachController.update, "update");
      route.delete("/:id", CoachController.delete, "delete");
    })
    .middleware([
      Auth.handle_api_key,
      Auth.authenticateUser,
      Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
    ]);

  route
    .group(() => {
      route.get("/", CoachController.getAll, "getAll");
      route.get("/:id", CoachController.get, "get");
    })
    .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);

  route.prefix("/coaches");

  return route;
};