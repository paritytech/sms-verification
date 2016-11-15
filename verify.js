'use strict'

const co = require('co-express')
const boom = require('boom')
const phone = require('phoneformat.js')
const sha3 = require('web3/lib/utils/sha3')

const web3 = require('./lib/web3')
const storage = require('./lib/storage')
const generateCode = require('./lib/generate-code')
const postToContract = require('./lib/post-to-contract')
const sendSMS = require('./lib/send-sms')

module.exports = co(function* (req, res) {
  const number = req.query.number
  if (!phone.isValidNumber(number)) {
    throw boom.badRequest('Phone number is not in E.164 format.')
  }

  const address = req.query.address.toLowerCase()
  if (!web3.isAddress(address)) throw boom.badRequest('Address is invalid.')

  let code
  try {
    code = yield generateCode()
  } catch (err) {
    console.error(err.message)
    throw boom.internal('An error occured while generating a code.')
  }

  const anonymized = sha3(number)
  try {
    if (yield storage.has(anonymized)) {
      throw boom.badRequest('This number has already been verified.')
    }
    yield storage.put(anonymized, code)
    console.info(`Hash of phone number (${anonymized}) put into DB.`)
  } catch (err) {
    console.error(err.message)
    throw boom.internal('An error occured while querying the database.')
  }

  try {
    const txHash = yield postToContract(address, code)
    console.info(`Challenge sent to contract (tx ${txHash}).`)
  } catch (err) {
    console.error(err.message)
    throw boom.internal('An error occured while sending to the contract.')
  }

  try {
    yield sendSMS(number, code)
    console.info(`Verification code sent to ${anonymized}.`)
    return res.status(202).json({
      status: 'ok',
      message: `Verification code sent to ${number}.`
    })
  } catch (err) {
    console.error(err.message)
    throw boom.internal('An error occured while sending the SMS.')
  }
})
