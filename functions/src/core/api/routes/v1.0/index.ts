import tournamentService from "./league_route";
import authService from "./auth_route";
import divisionService from "./division_route";
import teamService from "./team_route";

export = () => {
  tournamentService();
  authService();
  divisionService();
  teamService();
};
