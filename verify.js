'use strict'

const phone = require('phoneformat.js')
const sha3 = require('web3/lib/utils/sha3')
const shortid = require('shortid')

const web3 = require('./lib/web3')
const storage = require('./lib/storage')
const postToContract = require('./lib/post-to-contract')
const sendSMS = require('./lib/send-sms')

module.exports = (req, res) => {
  const number = req.query.number
  if (!phone.isValidNumber(number)) return res.status(400).json({
    status: 'error',
    message: 'Phone number is not in E.164 format.'
  })

  const address = req.query.address
  if (!web3.isAddress(address)) return res.status(400).json({
    status: 'error',
    message: 'Address is invalid.'
  })

  const anonymized = sha3(number)
  const code = shortid.generate()

  storage.has(anonymized)
  .then((isVerified) => {
    if (isVerified) return res.status(400).json({
      status: 'error',
      message: 'This number has already been verified.'
    })
    return storage.put(anonymized, code)
  })
  .then(() => {
    postToContract(number, code)
    .then((txHash) => {
      console.info(`Challenge sent to contract (tx ${txHash}).`)

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
