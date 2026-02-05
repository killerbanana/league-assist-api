import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import LeagueController from "../../app-configs/controllers/v1.0/league_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route
        .get("/all", LeagueController.all, "league.controller.all")
        .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);
    })

    .group(() => {
      route
        .post("/", LeagueController.create, "create")
        .middleware([Auth.handle_api_key, Auth.authenticateUser, Auth.authorizeRoles(["admin", "tournamentDirector"])]);
    })

    .prefix("/tournament")
    .namespace("league.controller");

  return route;
};
