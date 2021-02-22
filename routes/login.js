"use strict";
const express_1 = require("express");
const authFns = require("../helpers/authFns");
const configFns = require("../helpers/configFns");
const debug_1 = require("debug");
const debugLogin = debug_1.debug("contractor-prequal-system:routes:login");
const redirectURL = configFns.getProperty("reverseProxy.urlPrefix") + "/contractors";
const router = express_1.Router();
router.route("/")
    .get((req, res) => {
    const sessionCookieName = configFns.getProperty("session.cookieName");
    if (req.session.user && req.cookies[sessionCookieName]) {
        res.redirect(redirectURL);
    }
    else {
        res.render("login", {
            userName: "",
            message: ""
        });
    }
})
    .post(async (req, res) => {
    const userName = req.body.userName.toLowerCase();
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
    }
    catch (e) {
        debugLogin(e);
        return res.render("login", {
            userName,
            message: "Login Failed"
        });
    }
});
module.exports = router;
