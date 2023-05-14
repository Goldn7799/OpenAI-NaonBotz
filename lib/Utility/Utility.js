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

const utility = {
  makeid,
  copy
}
module.exports = utility
