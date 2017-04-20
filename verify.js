'use strict'

const co = require('co-express')
const boom = require('boom')
const sha3 = require('web3/lib/utils/sha3')

const web3 = require('./lib/web3')
const normalizeNumber = require('./lib/normalize-number')
const storage = require('./lib/storage')
const generateCode = require('./lib/generate-code')
const postToContract = require('./lib/post-to-contract')
const sendSMS = require('./lib/send-sms')

function internal (msg, err = null) {
  console.info(msg, err)
  return boom.internal(msg)
}

module.exports = co(function* (req, res) {
  let number = req.query.number
  try {
    number = yield normalizeNumber(number)
  } catch (err) {
    console.error(err)
    throw boom.badRequest('Phone number is invalid.')
  }

  const address = req.query.address && req.query.address.toLowerCase()
  if (!web3.isAddress(address)) throw boom.badRequest('Address is invalid.')

  let code
  try {
    code = yield generateCode()
  } catch (err) {
    throw internal('An error occured while generating a code.', err)
  }

  const anonymized = '0x' + sha3(number)
  try {
    if (yield storage.has(anonymized)) {
      throw boom.badRequest('This number has already been verified.')
    }
  } catch (err) {
    if (err.isBoom) throw err
    throw internal('An error occured while querying the database.', err)
  }

  try {
    const txHash = yield postToContract(address, code)
    console.info(`Challenge sent to contract (tx ${txHash}).`)
  } catch (err) {
    throw internal('An error occured while querying Parity.', err)
  }

  try {
    yield sendSMS(number, code)
    console.info(`Verification code sent to ${anonymized}.`)
  } catch (err) {
    throw internal('An error occured while sending the SMS.', err)
  }

  try {
    yield storage.put(anonymized, code)
    console.info(`Hash of phone number (${anonymized}) put into DB.`)
  } catch (err) {
    throw internal('An error occured while querying the database.', err)
  }

  return res.status(202).json({
    status: 'ok',
    message: `Verification code sent to ${number}.`
  })
})
