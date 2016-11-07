'use strict'

const sha3 = require('web3/lib/utils/sha3')
const shortid = require('shortid')

const storage = require('./storage')
const postToContract = require('./post-to-contract')
const sendSMS = require('./send-sms')

module.exports = (req, res) => {
  const number = req.params.number
  const anonymized = sha3(number)

  storage.has(anonymized)
  .then((isVerified) => {
    if (isVerified) return res.status(400).json({
      status: 'error',
      message: 'This number has already been verified.'
    })
    const code = shortid.generate()
    return storage.put(anonymized, code)
  })
  .then(() => {
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
  })
  .catch((err) => {
    console.error(err.message)
    return res.status(500).json({
      status: 'error',
      message: 'An error occured while querying the database.'
    })
  })
}
