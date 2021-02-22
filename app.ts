import * as createError from "http-errors";
import * as express from "express";

import { abuseCheck } from "@cityssm/express-abuse-points";
import * as compression from "compression";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as csurf from "csurf";
import * as rateLimit from "express-rate-limit";

import * as session from "express-session";
import * as sqlite from "connect-sqlite3";

import * as configFns from "./helpers/configFns";
import * as stringFns from "@cityssm/expressjs-server-js/stringFns";
import * as dateTimeFns from "@cityssm/expressjs-server-js/dateTimeFns";

import * as routerLogin from "./routes/login";
import * as routerContractors from "./routes/contractors";

import { debug } from "debug";
const debugApp = debug("contractor-prequal-system:app");


/*
 * INITIALIZE APP
 */


const app = express();

if (!configFns.getProperty("reverseProxy.disableEtag")) {
  app.set("etag", false);
}

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(abuseCheck({
  byXForwardedFor: configFns.getProperty("reverseProxy.blockViaXForwardedFor"),
  byIP: !configFns.getProperty("reverseProxy.blockViaXForwardedFor")
}));

if (!configFns.getProperty("reverseProxy.disableCompression")) {
  app.use(compression());
}

app.use((req, _res, next) => {
  debugApp(req.method + " " + req.url);
  next();
});

app.use(express.json());

app.use(express.urlencoded({
  extended: false
}));

app.use(cookieParser());
app.use(csurf({ cookie: true }));


/*
 * Rate Limiter
 */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000
});

app.use(limiter);


/*
 * STATIC ROUTES
 */


const urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");


app.use(urlPrefix, express.static(path.join(__dirname, "public")));

app.use(urlPrefix + "/lib/bulma-webapp-js",
  express.static(path.join(__dirname, "node_modules", "@cityssm", "bulma-webapp-js", "dist")));

app.use(urlPrefix + "/lib/fa5",
  express.static(path.join(__dirname, "node_modules", "@fortawesome", "fontawesome-free")));


/*
 * SESSION MANAGEMENT
 */


const SQLiteStore = sqlite(session);


const sessionCookieName = configFns.getProperty("session.cookieName");


// Initialize session
app.use(session({
  store: new SQLiteStore({
    dir: "data",
    db: "sessions.db"
  }),
  name: sessionCookieName,
  secret: configFns.getProperty("session.secret"),
  resave: true,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    maxAge: configFns.getProperty("session.maxAgeMillis"),
    sameSite: "strict"
  }
}));

// Clear cookie if no corresponding session
app.use((req, res, next) => {

  if (req.cookies[sessionCookieName] && !req.session.user) {
    res.clearCookie(sessionCookieName);
  }

  next();
});

// Redirect logged in users
const sessionChecker = (req: express.Request, res: express.Response, next: express.NextFunction) => {

  if (req.session.user && req.cookies[sessionCookieName]) {
    return next();
  }

  return res.redirect(urlPrefix + "/login");
};


/*
 * ROUTES
 */


// Make config objects available to the templates
app.use(function(req, res, next) {
  res.locals.configFns = configFns;
  res.locals.dateTimeFns = dateTimeFns;
  res.locals.stringFns = stringFns;
  res.locals.user = req.session.user;
  res.locals.csrfToken = req.csrfToken();
  res.locals.urlPrefix = configFns.getProperty("reverseProxy.urlPrefix");
  next();
});


app.get(urlPrefix + "/", sessionChecker, (_req, res) => {
  res.redirect(urlPrefix + "/contractors");
});

app.use(urlPrefix + "/contractors", sessionChecker, routerContractors);

app.use(urlPrefix + "/login", routerLogin);

app.get(urlPrefix + "/logout", (req, res) => {

  if (req.session.user && req.cookies[sessionCookieName]) {

    req.session.destroy(null);
    req.session = null;
    res.clearCookie(sessionCookieName);

  }

  res.redirect(urlPrefix + "/login");
});


// Catch 404 and forward to error handler
app.use(function(_req, _res, next) {
  next(createError(404));
});


// Error handler
app.use(function(err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) {

  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");

});


export = app;
