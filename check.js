'use strict'

const co = require('co-express')
const boom = require('boom')
const sha3 = require('web3/lib/utils/sha3')

const web3 = require('./lib/web3')
const normalizeNumber = require('./lib/normalize-number')
const storage = require('./lib/storage')

module.exports = co(function* (req, res) {
  let number = req.query.number
  try {
    number = yield normalizeNumber(number)
  } catch (err) {
    throw boom.badRequest('Phone number is invalid.')
  }
  const anonymized = sha3(number)

  const address = req.query.address.toLowerCase()
  if (!web3.isAddress(address)) throw boom.badRequest('Address is invalid.')

  try {
    // todo: check if the specified address is correct, to prevent mass retrieval of this information
    const hasRequested = yield storage.has(anonymized)
    if (!hasRequested) throw boom.notFound('There has not been requested any code for this phone number.')
    return res.status(200).json({
      status: 'ok',
      message: 'A code has been requested for this phone number.'
    })
  } catch (err) {
    if (err.isBoom) throw err
    throw boom.internal('An error occured while querying the database.')
  }
})
