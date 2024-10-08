import { fork } from 'node:child_process';
import path from 'node:path';
import { abuseCheck } from '@cityssm/express-abuse-points';
import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js';
import * as stringFns from '@cityssm/expressjs-server-js/stringFns.js';
import compression from 'compression';
import sqlite from 'connect-sqlite3';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import debug from 'debug';
import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import createError from 'http-errors';
import * as configFunctions from './helpers/configFunctions.js';
import router2fa from './routes/2fa.js';
import routerContractors from './routes/contractors.js';
import routerLogin from './routes/login.js';
const debugApp = debug('contractor-prequal-system:app');
export const app = express();
if (!configFunctions.getProperty('reverseProxy.disableEtag')) {
    app.set('etag', false);
}
app.set('views', path.join('views'));
app.set('view engine', 'ejs');
app.use(abuseCheck({
    byXForwardedFor: configFunctions.getProperty('reverseProxy.blockViaXForwardedFor'),
    byIP: !configFunctions.getProperty('reverseProxy.blockViaXForwardedFor')
}));
if (!configFunctions.getProperty('reverseProxy.disableCompression')) {
    app.use(compression());
}
app.use((request, _response, next) => {
    debugApp(request.method + ' ' + request.url);
    next();
});
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(csurf({ cookie: true }));
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1000
});
app.use(limiter);
const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix');
app.use(urlPrefix, express.static(path.join('public')));
app.use(urlPrefix + '/lib/bulma-webapp-js', express.static(path.join('node_modules', '@cityssm', 'bulma-webapp-js', 'dist')));
app.use(urlPrefix + '/lib/fa5', express.static(path.join('node_modules', '@fortawesome', 'fontawesome-free')));
const SQLiteStore = sqlite(session);
const sessionCookieName = configFunctions.getProperty('session.cookieName');
app.use(session({
    store: new SQLiteStore({
        dir: 'data',
        db: 'sessions.db'
    }),
    name: sessionCookieName,
    secret: configFunctions.getProperty('session.secret'),
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        maxAge: configFunctions.getProperty('session.maxAgeMillis'),
        sameSite: 'strict'
    }
}));
app.use((request, response, next) => {
    if (Object.hasOwn(request.cookies, sessionCookieName) &&
        !Object.hasOwn(request.session, 'user')) {
        response.clearCookie(sessionCookieName);
    }
    next();
});
function sessionChecker(request, response, next) {
    if (request.session.user && request.cookies[sessionCookieName]) {
        next();
        return;
    }
    response.redirect(urlPrefix + '/login');
}
const twoFactorChecker = (request, response, next) => {
    if (request.session.user.passed2FA) {
        next();
        return;
    }
    response.redirect(urlPrefix + '/2fa');
};
app.use(function (request, response, next) {
    response.locals.configFunctions = configFunctions;
    response.locals.dateTimeFns = dateTimeFns;
    response.locals.stringFns = stringFns;
    response.locals.user = request.session.user;
    response.locals.csrfToken = request.csrfToken();
    response.locals.urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix');
    next();
});
app.get(urlPrefix + '/', sessionChecker, (_request, response) => {
    response.redirect(urlPrefix + '/contractors');
});
app.use(urlPrefix + '/contractors', sessionChecker, twoFactorChecker, routerContractors);
app.use(urlPrefix + '/2fa', sessionChecker, router2fa);
app.use(urlPrefix + '/login', routerLogin);
app.get(urlPrefix + '/logout', (request, response) => {
    if (request.session.user && request.cookies[sessionCookieName]) {
        request.session.destroy(() => {
            response.clearCookie(sessionCookieName);
            response.redirect(urlPrefix);
        });
    }
    response.redirect(urlPrefix + '/login');
});
const childProcesses = {
    clearRisk: fork('./tasks/clearRiskInsuranceImport'),
    docuShare: fork('./tasks/docuShareSync'),
    wsib: fork('./tasks/wsibRefresh')
};
childProcesses.docuShare.on('message', (message) => {
    debugApp(message);
});
app.get(urlPrefix + '/tasks/:taskName', (request, response) => {
    const taskName = request.params.taskName;
    if (childProcesses[taskName]) {
        childProcesses[taskName].send('ping');
        return response.json(true);
    }
    return response.json(false);
});
app.use(function (_request, _response, next) {
    next(createError(404));
});
app.use(function (error, request, response) {
    response.locals.message = error.message;
    response.locals.error = request.app.get('env') === 'development' ? error : {};
    response.status(error.status || 500);
    response.render('error');
});
export default app;
