import { Router } from "express";

import * as authFns from "../helpers/authFns.js";

import * as configFns from "../helpers/configFns.js";


import debug from "debug";
const debugLogin = debug("contractor-prequal-system:routes:login");


const redirectURL = configFns.getProperty("reverseProxy.urlPrefix") + "/contractors";


export const router = Router();


router.route("/")
  .get((req, res) => {

    const sessionCookieName = configFns.getProperty("session.cookieName");

    if (req.session.user && req.cookies[sessionCookieName]) {
      res.redirect(redirectURL);

    } else {

      res.render("login", {
        userName: "",
        message: ""
      });
    }
  })
  .post(async (req, res) => {

    const userName: string = req.body.userName.toLowerCase();
    const passwordPlain = req.body.password;

    try {

      const isAuthenticated = await authFns.authenticate(userName, passwordPlain);

      if (isAuthenticated) {

        req.session.user = {
          userName: userName,
          canUpdate: configFns.getProperty("permissions.canUpdate").includes(userName)
        };

        return res.redirect(redirectURL);
      }

      return res.render("login", {
        userName,
        message: "Login Failed"
      });

    } catch (e) {

      debugLogin(e);

      return res.render("login", {
        userName,
        message: "Login Failed"
      });
    }
  });


export default router;
