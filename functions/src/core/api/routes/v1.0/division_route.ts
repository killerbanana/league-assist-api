import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import DivisionController from "../../app-configs/controllers/v1.0/division_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route.post("/", DivisionController.create, "create");
      route.patch("/:id", DivisionController.update, "update");
      route.delete("/:id", DivisionController.delete, "delete");
    })
    .middleware([
      Auth.handle_api_key,
      Auth.authenticateUser,
      Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
    ]);

  route
    .group(() => {
      route.get("/", DivisionController.getAll, "getAll");
    })
    .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);

  route.prefix("/divisions");

  return route;
};