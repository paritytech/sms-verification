'use strict'

const co = require('co-express')
const boom = require('boom')
const sha3 = require('web3/lib/utils/sha3')

const web3 = require('./lib/web3')
const normalizeNumber = require('./lib/normalize-number')
const hasRequested = require('./lib/has-requested')
const storage = require('./lib/storage')

module.exports = co(function* (req, res) {
  let number = req.query.number
  try {
    number = yield normalizeNumber(number)
  } catch (err) {
    throw boom.badRequest('Phone number is invalid.')
  }
  const anonymized = '0x' + sha3(number)

  const address = req.query.address && req.query.address.toLowerCase()
  if (!web3.isAddress(address)) throw boom.badRequest('Address is invalid.')

  try {
    if (!(yield hasRequested(address))) {
      throw boom.badRequest('There is no request by this address.')
    }
  } catch (err) {
    if (err.isBoom) throw err
    throw boom.wrap(err, 500, 'An error occured while querying Parity')
  }

  try {
    const hasRequested = yield storage.has(anonymized)
    if (!hasRequested) throw boom.notFound('There has not been sent any code to this phone number.')
    return res.status(200).json({
      status: 'ok',
      message: 'A code has been sent to this phone number.'
    })
  } catch (err) {
    if (err.isBoom) throw err
    console.error('Error querying the database: ', err)
    throw boom.internal('An error occured while querying the database.')
  }
})
