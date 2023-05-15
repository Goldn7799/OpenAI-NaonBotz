const similarity = require('similarity')
const config = require('../../config.json')

function makeid (length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
charactersLength))
  }
  return result
}

function copy (jsonData) {
  return JSON.parse(JSON.stringify(jsonData))
}

function matchItem (A, B) {
  if (similarity(A, B) >= config.bot.typoDificult) {
    return true
  } else {
    return false
  }
}

function capitalLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const utility = {
  makeid,
  copy,
  matchItem,
  capitalLetter
}
module.exports = utility
