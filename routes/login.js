import { Router } from "express";
import * as authFunctions from "../helpers/authFunctions.js";
import * as configFunctions from "../helpers/configFunctions.js";
import requestIP from "request-ip";
import { isPrivate } from "@cityssm/is-private-network-address";
import userHas2FA from "../helpers/twoFactorDB/has2FA.js";
import debug from "debug";
const debugLogin = debug("contractor-prequal-system:routes:login");
const redirectURL = configFunctions.getProperty("reverseProxy.urlPrefix") + "/contractors";
const redirectURL_2fa = configFunctions.getProperty("reverseProxy.urlPrefix") + "/2fa";
export const router = Router();
router.route("/")
    .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty("session.cookieName");
    if (request.session.user && request.cookies[sessionCookieName]) {
        response.redirect(redirectURL);
    }
    else {
        response.render("login", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName.toLowerCase();
    const passwordPlain = request.body.password;
    try {
        const isAuthenticated = await authFunctions.authenticate(userName, passwordPlain);
        if (isAuthenticated) {
            let passed2FA = true;
            if (configFunctions.getProperty("twoFactor.isEnabledInternally") || configFunctions.getProperty("twoFactor.isEnabledExternally")) {
                const ipAddress = requestIP.getClientIp(request);
                const isPrivateIP = isPrivate(ipAddress);
                if (configFunctions.getProperty("twoFactor.isRequiredInternally") && isPrivateIP) {
                    passed2FA = false;
                }
                else if (configFunctions.getProperty("twoFactor.isRequiredExternally") && !isPrivateIP) {
                    passed2FA = false;
                }
                else if ((configFunctions.getProperty("twoFactor.isEnabledInternally") && isPrivateIP) ||
                    (configFunctions.getProperty("twoFactor.isEnabledExternally") && !isPrivateIP)) {
                    passed2FA = !(await userHas2FA(userName));
                }
            }
            request.session.user = {
                userName: userName,
                canUpdate: configFunctions.getProperty("permissions.canUpdate").includes(userName),
                passed2FA
            };
            return response.redirect(passed2FA
                ? redirectURL
                : redirectURL_2fa);
        }
        return response.render("login", {
            userName,
            message: "Login Failed"
        });
    }
    catch (error) {
        debugLogin(error);
        return response.render("login", {
            userName,
            message: "Login Failed"
        });
    }
});
export default router;
