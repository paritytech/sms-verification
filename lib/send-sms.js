'use strict'

const cfg = require('config').twilio
const twilio = require('twilio')(cfg.id, cfg.token)

const sendSMS = (receiver, code) =>
  new Promise((resolve, reject) => {
    twilio.messages.create({
      from: cfg.sender,
      to: receiver,
      body: `Your Parity verification code is ${code}.`
    }, (err, msg) => {
      if (err) reject(err)
      else resolve(msg)
    })
  })

module.exports = sendSMS
