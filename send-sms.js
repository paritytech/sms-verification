'use strict'

const { id, token, sender } = require('config')
const twilio = require('twilio')(id, token)

const sendSMS = (receiver, code) =>
  new Promise((resolve, reject) => {
    twilio.messages.create({
      from: sender,
      to: receiver,
      body: `Your Parity verification code is ${code}.`
    }, (err, msg) => {
      if (err) reject(err)
      else resolve(msg)
    })
  })

module.exports = sendSMS
