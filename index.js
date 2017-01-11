'use strict'

const express = require('express')
const hsts = require('hsts')
const corser = require('corser')
const noCache = require('nocache')()
const morgan = require('morgan')
const sha3 = require('web3/lib/utils/sha3')
const bodyParser = require('body-parser')
const config = require('config')
const spdy = require('spdy')
const fs = require('fs')

const nodeIsSynced = require('./lib/node-is-synced')
const verify = require('./verify')

const api = express()
module.exports = api

api.use(hsts({maxAge: 3 * 24 * 60 * 60 * 1000})) // 3 days

// CORS
const allowed = corser.simpleRequestHeaders.concat(['User-Agent'])
api.use(corser.create({requestHeaders: allowed}))

api.use(bodyParser.json())

morgan.token('number', (req) => sha3(req.query.number))
morgan.token('address', (req) => req.query.address)
api.use(morgan(':date[iso] :number :address :status :response-time ms'))

api.get('/health', noCache, (req, res, next) => {
  nodeIsSynced()
  .catch(() => false)
  .then((isSynced) => {
    console.log('isSynced', isSynced)
    res.status(isSynced ? 200 : 500).end()
  })
})

api.post('/', noCache, verify)

api.use((err, req, res, next) => {
  if (res.headersSent) return next()
  return res
  .status(err.isBoom ? err.output.statusCode : 500)
  .json({status: 'error', message: err.message})
})

const server = spdy.createServer({
  cert: fs.readFileSync(config.http.cert),
  key: fs.readFileSync(config.http.key)
}, api)
server.listen(config.http.port, (err) => {
  if (err) return console.error(err)
  console.info(`Listening on ${config.http.port}.`)
})
