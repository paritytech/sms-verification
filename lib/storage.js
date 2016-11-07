'use strict'

const levelup = require('levelup')
const config = require('config')



const db = levelup(config.db)

module.exports = {
  has: (key) => new Promise((resolve, reject) => {
    db.get(key, (err) => {
      if (!err) resolve(true)
      else if (err.notFound) resolve(false)
      else reject(err)
    })
  }),

  get: (key) => new Promise((resolve, reject) => {
    db.get(key, (err, value) => {
      if (err) reject(err)
      else resolve(value)
    })
  }),

  put: (key, value) => new Promise((resolve, reject) => {
    db.put(key, value, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })
}
