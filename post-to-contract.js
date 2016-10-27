'use strict'

const { address, owner } = require('config')
const abi = require('./SMSVerification.abi.json')

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const sha3 = web3.sha3

const contract = web3.eth.contract(abi).at(address)

const postToContract = (number, code) =>
  new Promise((resolve, reject) => {
    const numberHash = sha3(number)
    // The response to the challenge. Because arbitrary-length strings don't play nicely with contracts, we use `sha3(code)`.
    const token = sha3(code)
    // Will be stored inside the (public) contract, paired with `sha3(number)`.
    const tokenHash = sha3(token, {encoding: 'hex'})

    if (contract.certified(numberHash))
      return reject(new Error('This number is already verified.'))

    contract.puzzle.sendTransaction(tokenHash, numberHash, {
      from: owner
    }, (err, address) => {
      if (err) reject(err)
      else resolve(address)
    })
  })

module.exports = postToContract
