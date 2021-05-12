import { Router } from "express";
import getSecretKey from "../helpers/twoFactorDB/getSecretKey.js";
import { authenticator } from "otplib";
import * as configFns from "../helpers/configFns.js";
import debug from "debug";
const debugLogin = debug("contractor-prequal-system:routes:login");
const redirectURL = configFns.getProperty("reverseProxy.urlPrefix") + "/contractors";
export const router = Router();
authenticator.options = {
    window: [2, 2]
};
router.route("/")
    .get((req, res) => {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName] && req.session.user.passed2FA) {
        res.redirect(redirectURL);
    }
    else {
        res.render("2fa", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (req, res) => {
    const userName = req.body.userName.toLowerCase();
    const token = req.body.token;
    try {
        const secret = await getSecretKey(userName);
        if (!secret || secret === "") {
            return res.render("2fa", {
                userName,
                message: "Setting up two-factor authentication may be incomplete.  Please contact IT for assistance"
            });
        }
        const passed2FA = authenticator.verify({
            token,
            secret
        });
        if (passed2FA) {
            req.session.user.passed2FA = true;
            return res.redirect(redirectURL);
        }
        return res.render("2fa", {
            userName,
            message: "Token not valid."
        });
    }
    catch (e) {
        debugLogin(e);
        return res.render("2fa", {
            userName,
            message: "Unknown Error"
        });
    }
});
export default router;
