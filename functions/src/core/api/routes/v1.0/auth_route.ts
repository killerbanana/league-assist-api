import { Route } from "src/core/router/Route";
import Auth from "src/core/middlewares/auth";
import UserController from "../../app-configs/controllers/v1.0/auth_controller";

export = () => {
  const route = new Route();

  route
    .group(() => {
      route.post("/create-session", Auth.createSessionCookie, "auth.controller.sessionLogin");
      route.post("/login", UserController.login, "user.controller.login");
      route.get("/check-session", Auth.checkSession, "auth.controller.checkSession");
    })
    .middleware([Auth.handle_api_key]);

  route
    .group(() => {
      route.post("/register", UserController.register, "user.controller.register");
    })
    .middleware([Auth.handle_api_key]);

  route.group(() => {
    route.post("/request-api-key", UserController.generate_api_key, "user.controller.register");
  });

  route
    .group(() => {
      route.post("/logout", UserController.logout, "user.controller.logout");
    })
    .middleware([Auth.handle_api_key, Auth.authenticateUser, Auth.logout]);

  route
    .group(() => {
      route.post("/register-admin", UserController.registerAdmin, "user.controller.registerAdmin");
      route
        .get("/all", UserController.all, "user.controller.all")
        .middleware([
          Auth.handle_api_key,
          Auth.authenticateUser,
          Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
        ]);
      route
        .get("/:uid", UserController.get, "user.controller.get")
        .middleware([
          Auth.handle_api_key,
          Auth.authenticateUser,
          Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
        ]);
      route
        .patch("/:uid", UserController.update, "user.controller.update")
        .middleware([
          Auth.handle_api_key,
          Auth.authenticateUser,
          Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
        ]);
      route
        .delete("/:uid", UserController.delete, "user.controller.delete")
        .middleware([
          Auth.handle_api_key,
          Auth.authenticateUser,
          Auth.authorizeRoles(["admin", "tournamentDirector", "siteDirector"]),
        ]);
    })
    .prefix("/users");

  return route;
};
