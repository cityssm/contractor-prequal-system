import { Router } from "express";

import * as authFns from "../helpers/authFns";

import * as configFns from "../helpers/configFns";


const redirectURL = "/contractors";


const router = Router();


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

    const userName = req.body.userName;
    const passwordPlain = req.body.password;

    try {

      const isAuthenticated = await authFns.authenticate(userName, passwordPlain);

      if (isAuthenticated) {

        req.session.user = {
          userName: userName
        };

        return res.redirect(redirectURL);
      }

      return res.render("login", {
        userName,
        message: "Login Failed"
      });

    } catch (_e) {

      return res.render("login", {
        userName,
        message: "Login Failed"
      });
    }
  });


export = router;
