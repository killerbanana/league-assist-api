import tournamentService from "./tournament_route";
import authService from "./auth_route";

export = () => {
  tournamentService();
  authService();
};
