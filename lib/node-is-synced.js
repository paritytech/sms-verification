'use strict'

const manualCall = require('./manual-rpc-call')

// todo: remove this once https://github.com/ethereum/web3.js/pull/545 is merged & released
const nodeIsSynced = () =>
  manualCall({method: 'eth_syncing'})
  .then((isSyncing) => isSyncing === false)

module.exports = nodeIsSynced
