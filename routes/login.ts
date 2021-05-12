import { Router } from "express";

import * as authFns from "../helpers/authFns.js";

import * as configFns from "../helpers/configFns.js";

import requestIP from "request-ip";
import { isPrivate } from "@cityssm/is-private-network-address";
import userHas2FA from "../helpers/twoFactorDB/has2FA.js";

import debug from "debug";
const debugLogin = debug("contractor-prequal-system:routes:login");


const redirectURL = configFns.getProperty("reverseProxy.urlPrefix") + "/contractors";
const redirectURL_2fa = configFns.getProperty("reverseProxy.urlPrefix") + "/2fa";


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

        let passed2FA = true;

        if (configFns.getProperty("twoFactor.isEnabledInternally") || configFns.getProperty("twoFactor.isEnabledExternally")) {

          const ipAddress = requestIP.getClientIp(req);

          console.log(ipAddress);

          const isPrivateIP = isPrivate(ipAddress);

          console.log(isPrivateIP);

          if (configFns.getProperty("twoFactor.isRequiredInternally") && isPrivateIP) {

            // if mandatory internally
            passed2FA = false;

          } else if (configFns.getProperty("twoFactor.isRequiredExternally") && !isPrivateIP) {

            // if mandatory externally
            passed2FA = false;

          } else if ((configFns.getProperty("twoFactor.isEnabledInternally") && isPrivateIP) ||
            (configFns.getProperty("twoFactor.isEnabledExternally") && !isPrivateIP)) {

            // optional, check if enabled
            passed2FA = !(await userHas2FA(userName));
          }
        }

        req.session.user = {
          userName: userName,
          canUpdate: configFns.getProperty("permissions.canUpdate").includes(userName),
          passed2FA
        };

        return res.redirect(passed2FA
          ? redirectURL
          : redirectURL_2fa);
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
