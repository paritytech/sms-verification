'use strict'

const Web3 = require('web3')
const config = require('config')

const web3 = new Web3(new Web3.providers.HttpProvider('http://' + config.parity.host))

module.exports = web3
