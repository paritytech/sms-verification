'use strict'

const config = require('config')

const {fetch} = require('fetch-ponyfill')()

// todo: remove this once https://github.com/ethereum/web3.js/pull/545 is merged & released
const nodeIsSynced = () =>
  fetch('http://' + config.parity.host, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_syncing',
      params: [],
      id: 0
    })
  })
  .then((res) => {
    if (res.ok) return res.json()
    throw new Error('response not ok')
  })
  .then((data) => data.result === false)

module.exports = nodeIsSynced
