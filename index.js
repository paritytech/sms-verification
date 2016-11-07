'use strict'

const express = require('express')
const hsts = require('hsts')
const corser = require('corser')
const noCache = require('nocache')()
const bodyParser = require('body-parser')
const config = require('config')
const spdy = require('spdy')
const fs = require('fs')

const verify = require('./verify')

const api = express()
module.exports = api

api.use(hsts({maxAge: 3 * 24 * 60 * 60 * 1000})) // 3 days

// CORS
const allowed = corser.simpleRequestHeaders.concat(['User-Agent'])
api.use(corser.create({requestHeaders: allowed}))

api.use(bodyParser.json())

api.post('/', noCache, verify)

const server = spdy.createServer({
  cert: fs.readFileSync(config.http.cert),
  key: fs.readFileSync(config.http.key)
}, api)
server.listen(config.http.port, (err) => {
  if (err) return console.error(err)
  console.info(`Listening on ${config.http.port}.`)
})
