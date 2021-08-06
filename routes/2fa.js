import { Router } from "express";
import { getSecretKey } from "../helpers/twoFactorDB/getSecretKey.js";
import { authenticator } from "otplib";
import * as configFunctions from "../helpers/configFunctions.js";
import debug from "debug";
const debugLogin = debug("contractor-prequal-system:routes:login");
const redirectURL = configFunctions.getProperty("reverseProxy.urlPrefix") + "/contractors";
export const router = Router();
authenticator.options = {
    window: [2, 2]
};
router.route("/")
    .get((request, response) => {
    const sessionCookieName = configFunctions.getProperty("session.cookieName");
    if (request.session.user && request.cookies[sessionCookieName] && request.session.user.passed2FA) {
        response.redirect(redirectURL);
    }
    else {
        response.render("2fa", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (request, response) => {
    const userName = request.body.userName.toLowerCase();
    const token = request.body.token;
    try {
        const secret = await getSecretKey(userName);
        if (!secret || secret === "") {
            return response.render("2fa", {
                userName,
                message: "Setting up two-factor authentication may be incomplete.  Please contact IT for assistance"
            });
        }
        const passed2FA = authenticator.verify({
            token,
            secret
        });
        if (passed2FA) {
            request.session.user.passed2FA = true;
            return response.redirect(redirectURL);
        }
        return response.render("2fa", {
            userName,
            message: "Token not valid."
        });
    }
    catch (error) {
        debugLogin(error);
        return response.render("2fa", {
            userName,
            message: "Unknown Error"
        });
    }
});
export default router;
