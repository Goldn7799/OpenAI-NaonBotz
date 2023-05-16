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

function timeParse (hours, minute, second) {
  if (`${hours}` && `${minute}` && `${second}` !== 'undefined') {
    return `${(`${hours}`.length > 1) ? `${hours}` : `0${hours}`}:${(`${minute}`.length > 1) ? `${minute}` : `0${minute}`}:${(`${second}`.length > 1) ? `${second}` : `0${second}`}`
  } else if (`${hours}` && `${minute}`) {
    return `${(`${hours}`.length > 1) ? `${hours}` : `0${hours}`}:${(`${minute}`.length > 1) ? `${minute}` : `0${minute}`}`
  } else {
    return false
  }
}

const utility = {
  makeid,
  copy,
  matchItem,
  capitalLetter,
  timeParse
}
module.exports = utility
