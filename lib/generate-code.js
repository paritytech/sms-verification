'use strict'

const web3 = require('./web3')

// TODO use `web3._extend` for this
const generateCode = () =>
  new Promise((resolve, reject) => {
    web3._requestManager.sendAsync({
      method: 'parity_generateSecretPhrase'
    }, (err, code) => {
      const words = code.split(' ')
      if (err) reject(err)
      else resolve(words.slice(0, 4).join(' '))
    })
  })

module.exports = generateCode
