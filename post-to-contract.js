'use strict'

const { address } = require('config')
const abi = require('./SMSVerification.abi.json')
const sha3 = require('js-sha3').keccak_256

const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
const contract = web3.eth.contract(abi).at(address)

const postToContract = (number, code) =>
  new Promise((resolve, reject) => {
    // The response to the challenge. Because arbitrary-length strings don't play nicely with contracts, we use `sha3(code)`.
    const token = sha3(code)
    // Will be stored inside the (public) contract, paired with `sha3(number)`.
    const challenge = sha3(token)

    // TODO post to contract
    const numberHash = sha3(number)
    contract.challenge.sendTransaction(numberHash, challenge, (err, address) => {
      if (err) reject(err)
      else resolve(address)
    })
  })

module.exports = postToContract
