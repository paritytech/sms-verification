'use strict'

const { address, owner, passwordFile } = require('config')
const password = require('fs').readFileSync(passwordFile, {encoding: 'utf8'}).trim()
const abi = require('./SMSVerification.abi.json')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const sha3 = web3.sha3

const contract = web3.eth.contract(abi).at(address)

const hasRequested = (numberHash) =>
  new Promise((resolve, reject) => {
    contract.Requested({encryptedNumber: numberHash}, {fromBlock: 0, toBlock: 'latest'})
    .watch((err, data) => {
      if (err) return reject(err)
      if (data && data.type === 'mined') {
        resolve(data.args.encryptedNumber === numberHash)
      }
    })
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

const postToContract = (number, code) =>
  new Promise((resolve, reject) => {
    const numberHash = sha3(number)
    // The response to the challenge. Because arbitrary-length strings don't play nicely with contracts, we use `sha3(code)`.
    const token = sha3(code)
    // Will be stored inside the (public) contract, paired with `sha3(number)`.
    const tokenHash = sha3(token, {encoding: 'hex'})

    if (contract.certified(numberHash)) {
      return reject(new Error('This number is already verified.'))
    }

    hasRequested(numberHash)
    .then((hasRequested) => {
      if (!hasRequested) return reject(new Error('Verification of this number not requested.'))

      signAndSendTransaction({
        from: owner,
        to: address,
        data: contract.puzzle.getData(tokenHash, numberHash)
      }, password, (err, address) => {
        if (err) reject(err)
        else resolve(address)
      })
    })
    .catch(reject)
  })

module.exports = postToContract
