import { fork } from 'node:child_process'
import path from 'node:path'

import { abuseCheck } from '@cityssm/express-abuse-points'
import * as dateTimeFns from '@cityssm/expressjs-server-js/dateTimeFns.js'
import * as stringFns from '@cityssm/expressjs-server-js/stringFns.js'
import compression from 'compression'
import sqlite from 'connect-sqlite3'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import debug from 'debug'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import createError from 'http-errors'

import * as configFunctions from './helpers/configFunctions.js'
import router2fa from './routes/2fa.js'
import routerContractors from './routes/contractors.js'
import routerLogin from './routes/login.js'

const debugApp = debug('contractor-prequal-system:app')

/*
 * INITIALIZE APP
 */

export const app = express()

if (!configFunctions.getProperty('reverseProxy.disableEtag')) {
  app.set('etag', false)
}

// View engine setup
app.set('views', path.join('views'))
app.set('view engine', 'ejs')

app.use(
  abuseCheck({
    byXForwardedFor: configFunctions.getProperty(
      'reverseProxy.blockViaXForwardedFor'
    ),
    byIP: !configFunctions.getProperty('reverseProxy.blockViaXForwardedFor')
  })
)

if (!configFunctions.getProperty('reverseProxy.disableCompression')) {
  app.use(compression())
}

app.use((request, _response, next) => {
  debugApp(request.method + ' ' + request.url)
  next()
})

app.use(express.json())

app.use(
  express.urlencoded({
    extended: false
  })
)

app.use(cookieParser())
app.use(csurf({ cookie: true }))

/*
 * Rate Limiter
 */

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000
})

app.use(limiter)

/*
 * STATIC ROUTES
 */

const urlPrefix = configFunctions.getProperty('reverseProxy.urlPrefix')

app.use(urlPrefix, express.static(path.join('public')))

app.use(
  urlPrefix + '/lib/bulma-webapp-js',
  express.static(
    path.join('node_modules', '@cityssm', 'bulma-webapp-js', 'dist')
  )
)

app.use(
  urlPrefix + '/lib/fa5',
  express.static(path.join('node_modules', '@fortawesome', 'fontawesome-free'))
)

/*
 * SESSION MANAGEMENT
 */

const SQLiteStore = sqlite(session)

const sessionCookieName: string = configFunctions.getProperty('session.cookieName')

// Initialize session
app.use(
  session({
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
  })
)

// Clear cookie if no corresponding session
app.use((request, response, next) => {
  if (
    Object.hasOwn(request.cookies, sessionCookieName) &&
    !Object.hasOwn(request.session, 'user')
  ) {
    response.clearCookie(sessionCookieName)
  }

  next()
})

// Redirect logged in users
function sessionChecker(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
): void {
  if (request.session.user && request.cookies[sessionCookieName]) {
    next()
    return
  }

  response.redirect(urlPrefix + '/login')
}

// Redirect 2fa
const twoFactorChecker = (
  request: express.Request,
  response: express.Response,
  next: express.NextFunction
) => {
  if (request.session.user.passed2FA) {
    next()
    return
  }

  response.redirect(urlPrefix + '/2fa')
}

/*
 * ROUTES
 */

// Make config objects available to the templates
app.use(function (request, response, next) {
  response.locals.configFunctions = configFunctions
  response.locals.dateTimeFns = dateTimeFns
  response.locals.stringFns = stringFns
  response.locals.user = request.session.user
  response.locals.csrfToken = request.csrfToken()
  response.locals.urlPrefix = configFunctions.getProperty(
    'reverseProxy.urlPrefix'
  )
  next()
})

app.get(urlPrefix + '/', sessionChecker, (_request, response) => {
  response.redirect(urlPrefix + '/contractors')
})

app.use(
  urlPrefix + '/contractors',
  sessionChecker,
  twoFactorChecker,
  routerContractors
)

app.use(urlPrefix + '/2fa', sessionChecker, router2fa)

app.use(urlPrefix + '/login', routerLogin)

app.get(urlPrefix + '/logout', (request, response) => {
  if (request.session.user && request.cookies[sessionCookieName]) {
    request.session.destroy(() => {
      response.clearCookie(sessionCookieName)
      response.redirect(urlPrefix)
    })
  }

  response.redirect(urlPrefix + '/login')
})

/*
 * Initialize background tasks
 */

const childProcesses = {
  clearRisk: fork('./tasks/clearRiskInsuranceImport'),
  docuShare: fork('./tasks/docuShareSync'),
  wsib: fork('./tasks/wsibRefresh')
}

childProcesses.docuShare.on('message', (message) => {
  debugApp(message)
})

app.get(urlPrefix + '/tasks/:taskName', (request, response) => {
  const taskName = request.params.taskName

  if (childProcesses[taskName]) {
    childProcesses[taskName].send('ping')
    return response.json(true)
  }

  return response.json(false)
})

// Catch 404 and forward to error handler
app.use(function (_request, _response, next) {
  next(createError(404))
})

// Error handler
app.use(function (
  error: Error,
  request: express.Request,
  response: express.Response
) {
  // Set locals, only providing error in development
  response.locals.message = error.message
  response.locals.error = request.app.get('env') === 'development' ? error : {}

  // Render the error page
  response.status(error.status || 500)
  response.render('error')
})

export default app
