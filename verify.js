'use strict'

const { id, token } = require('./credentials.json')
const twilio = require('twilio')(id, token)

module.exports = (req, res) => {
  res.end('foo')
}
