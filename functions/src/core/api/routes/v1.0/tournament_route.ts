import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import TournamentController from "../../app-configs/controllers/v1.0/tournament_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route
        .get("/all", TournamentController.all, "tournament.controller.all")
        .middleware([Auth.handle_api_key, Auth.authenticateUserOptional]);
    })

    .group(() => {
      route
        .post("/", TournamentController.createTournament, "create")
        .middleware([Auth.handle_api_key, Auth.authenticateUser, Auth.authorizeRoles(["admin", "tournamentDirector"])]);
    })

    .prefix("/tournament")
    .namespace("tournament.controller");

  return route;
};
