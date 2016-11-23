'use strict'

const cfg = require('config').twilio
const Client = require('twilio').LookupsClient
const twilio = new Client(cfg.id, cfg.token)

const normalizeNumber = (number) =>
  twilio.phoneNumbers(number).get()
  .then((data) => data.phone_number)

module.exports = normalizeNumber
