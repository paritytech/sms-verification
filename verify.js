'use strict'

const postToContract = require('./post-to-contract')
const sendSMS = require('./send-sms')
const shortid = require('shortid')

module.exports = (req, res) => {
  if (!req.body || typeof req.body.phoneNumber !== 'string') {
    return res.status(400).json({
      status: 'error',
      message: 'Missing phoneNumber in body.'
    })
  }
  const receiver = req.body.phoneNumber

  const code = shortid.generate()

  postToContract(receiver, code)
  .then((address) => {
    console.info(`Challenge sent to contract (tx ${address}).`)

    sendSMS(receiver, code)
    .then((msg) => {
      console.info(`Verification code sent to ${receiver}.`)
      res.status(202).json({
        status: 'ok',
        message: `Verification code sent to ${receiver}.`
      })
    })
    .catch((err) => {
      console.error(err.message)
      res.status(500).json({
        status: 'error',
        message: 'An error occured while sending the SMS.'
      })
    })

  })
  .catch((err) => {
    console.error(err.message)
    res.status(500).json({
      status: 'error',
      message: 'An error occured while sending to the contract.'
    })
  })
}
