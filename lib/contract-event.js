'use strict'

const co = require('co')
const utils = require('web3/lib/utils/utils')
const sha3 = require('web3/lib/utils/sha3')

const web3 = require('./web3')
const manualRpcCall = require('./manual-rpc-call')

const getBlockNumber = () =>
  new Promise((resolve, reject) => {
    web3.eth.getBlockNumber((err, currentBlock) => {
      if (err) reject(err)
      else resolve(currentBlock)
    })
  })

const contractEvent = co.wrap(function* (contract, abi, name, topics = []) {
  const event = abi.find((item) => item.name === name)

  const currentBlock = yield getBlockNumber()

  const filterId = yield manualRpcCall({
    method: 'eth_newFilter',
    params: [{
      address: contract.address,
      topics: [
        '0x' + sha3(utils.transformToFullName(event)) // event signature
      ].concat(topics),
      fromBlock: '0x0',
      toBlock: utils.toHex(currentBlock),
      limit: 1
    }]
  })

  const unsubscribe = () =>
    manualRpcCall({
      method: 'eth_uninstallFilter',
      params: [filterId]
    })

  const getLogs = () =>
    manualRpcCall({
      method: 'eth_getFilterLogs',
      params: [filterId]
    })
    .then((logs) => logs.map((log) => {
      log.params = log.topics.slice(1).reduce((params, topic, i) => {
        params[event.inputs[i].name] = topic
        return params
      }, {})
      return log
    }))

  return {getLogs, unsubscribe}
})

module.exports = contractEvent
