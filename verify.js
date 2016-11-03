'use strict'

const postToContract = require('./post-to-contract')
const sendSMS = require('./send-sms')
const shortid = require('shortid')

module.exports = (req, res) => {
  const number = req.params.number
  const anonymized = number.slice(-3)
  const code = shortid.generate()

  postToContract(number, code)
  .then((address) => {
    console.info(`Challenge sent to contract (tx ${address}).`)

    sendSMS(number, code)
    .then((msg) => {
      console.info(`Verification code sent to …${anonymized}.`)
      res.status(202).json({
        status: 'ok',
        message: `Verification code sent to ${number}.`
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
