import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import PlayerController from "../../app-configs/controllers/v1.0/player_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route.post("/", PlayerController.create, "create");
      route.patch("/:id", PlayerController.update, "update");
      route.delete("/:id", PlayerController.delete, "delete");
    })
    .middleware([
      Auth.handle_api_key,
      Auth.authenticateUser,
      Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
    ]);

  route
    .group(() => {
      route.get("/", PlayerController.getAll, "getAll");
      route.get("/:id", PlayerController.getOne, "getOne");
    })
    .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);

  route.prefix("/players");

  return route;
};