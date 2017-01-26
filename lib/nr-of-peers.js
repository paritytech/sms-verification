'use strict'

const manualCall = require('./manual-rpc-call')
const {toDecimal} = require('web3/lib/utils/utils')

// todo: remove this once there's an async web3.net.peerCount()
const nrOfPeers = () =>
  manualCall({method: 'net_peerCount'})
  .then((peers) => toDecimal(peers))

module.exports = nrOfPeers
