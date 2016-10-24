'use strict'

const express = require('express')
const corser = require('corser')
const noCache = require('nocache')()

const verify = require('./verify')

const api = express()
module.exports = api

// CORS
const allowed = corser.simpleRequestHeaders.concat(['User-Agent'])
api.use(corser.create({requestHeaders: allowed}))

api.post('/verify', noCache, verify)

api.listen(3000, (err) => {
  if (err) return console.error(err)
  console.info(`Listening on 3000.`)
})
