'use strict'

const fs = require('fs')
const path = require('path')
const co = require('co')
const utils = require('web3/lib/utils/utils')
const coder = require('web3/lib/solidity/coder')
const sha3 = require('web3/lib/utils/sha3')

const { address, owner, passwordFile } = require('config')
const web3 = require('./web3')
const manualRpcCall = require('./manual-rpc-call')

const password = fs.readFileSync(passwordFile, {encoding: 'utf8'}).trim()

const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/ProofOfSMS.abi')))
const Requested = abi.find((item) => item.name === 'Requested')
const contract = web3.eth.contract(abi).at(address)

// In order to find the last `Requested` event for an account efficiently, we need to use the Parity-proprietary `limit` parameter (https://github.com/ethcore/parity/blob/a58fad06a7955247e4f01dd98cd97bab2d82f71f/js/src/jsonrpc/interfaces/eth.js#L933-L937). web3.js filters it out, so we need to make the RPC calls manually.
// todo: move back to web3 once `limit` or some comparable mechanism is in the standard or switch to Parity.js
const hasRequested = co.wrap(function* (who, emailHash) {
  const currentBlock = yield new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, currentBlock) => {
      if (err) reject(err)
      else resolve(currentBlock)
    })
  })

  const filterId = yield manualRpcCall({
    method: 'eth_newFilter',
    params: [{
      address: contract.address,
      topics: [
        '0x' + sha3(utils.transformToFullName(Requested)), // event signature
        '0x' + coder.encodeParam('address', who) // 1st indexed param
      ],
      fromBlock: '0x0',
      toBlock: utils.toHex(currentBlock),
      limit: 1
    }]
  })

  const unsubscribe = () => manualRpcCall({
    method: 'eth_uninstallFilter',
    params: [filterId]
  })

  try {
    const [log] = yield manualRpcCall({
      method: 'eth_getFilterLogs',
      params: [filterId]
    })
    yield unsubscribe()

    return !!log
  } catch (err) {
    yield unsubscribe()
    throw err
  }
})

// TODO use `web3._extend` for this
const signAndSendTransaction = (data, password, cb) =>
  web3._requestManager.sendAsync({
    method: 'personal_signAndSendTransaction',
    params: [data, password]
  }, (err, data) => {
    if (err) cb(err)
    else cb(null, data)
  })

const postToContract = (who, code) =>
  new Promise((resolve, reject) => {
    // The response to the challenge. Because arbitrary-length strings don't play nicely with contracts, we use `sha3(code)`.
    const token = '0x' + sha3(code)
    // Will be stored inside the (public) contract, paired with `who`.
    const tokenHash = sha3(token, {encoding: 'hex'})

    if (contract.certified(who)) {
      return reject(new Error('This address has already been verified.'))
    }

    hasRequested(who)
    .then((hasRequested) => {
      if (!hasRequested) return reject(new Error('Verification of this address not requested.'))

      console.info(`Sending challenge to contract.`)
      signAndSendTransaction({
        from: owner,
        to: address,
        data: contract.puzzle.getData(who, tokenHash)
      }, password, (err, txHash) => {
        if (err) reject(err)
        else resolve(txHash)
      })
    })
    .catch(reject)
  })

module.exports = postToContract
