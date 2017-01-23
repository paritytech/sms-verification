'use strict'

const config = require('config')
const {fetch} = require('fetch-ponyfill')()
const {toDecimal} = require('web3/lib/utils/utils')

// todo: remove this once there's an async web3.net.peerCount()
const nrOfPeers = () =>
  fetch('http://' + config.parity.host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'net_peerCount',
      params: [],
      id: 0
    })
  })
  .then((res) => {
    if (res.ok) return res.json()
    throw new Error('response not ok')
  })
  .then((data) => toDecimal(data.result))

module.exports = nrOfPeers
