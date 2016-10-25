'use strict'

const postToContract = require('./post-to-contract')
const sendSMS = require('./send-sms')

module.exports = (req, res) => {
  res.end('foo')
}
