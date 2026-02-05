import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import TeamController from "../../app-configs/controllers/v1.0/team_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route.post("/", TeamController.create, "create");
      route.patch("/:id", TeamController.update, "update");
      route.delete("/:id", TeamController.delete, "delete");
    })
    .middleware([
      Auth.handle_api_key,
      Auth.authenticateUser,
      Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
    ]);

  route
    .group(() => {
      route.get("/", TeamController.getAll, "getAll");
      route.get("/:id", TeamController.get, "get");
    })
    .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);

  route.prefix("/teams");

  return route;
};