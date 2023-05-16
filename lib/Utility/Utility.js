const similarity = require('similarity')
const config = require('../../config.json')
const databases = require('../Database/Database')
const { exec, spawn } = require('child_process')

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

const pickRandomObject = (wordList) => {
  return wordList[Math.floor(Math.random() * wordList.length)]
}
const pickRandomString = (wordList) => {
  return `${wordList[Math.floor(Math.random() * wordList.length)]}`
}

function makeProgressBar (rawProgress, rawTitle) {
  return new Promise((resolve) => {
    let progress = 0
    const title = (rawTitle) || 'Loading'
    const next = () => {
      try {
        const barWidth = 20
        const percent = Math.round(progress)
        const completeWidth = Math.round((barWidth * progress) / 100)
        const incompleteWidth = barWidth - completeWidth
        resolve(`${title} [${'='.repeat(completeWidth)}${' '.repeat(incompleteWidth)}] ${percent.toFixed(1)}%`)
      } catch (e) {
        resolve(false)
        databases.func.putLog(`[.red.]ProgressBar Error : ${e}`)
      }
    }
    if (rawProgress > 100) {
      progress = 100
      next()
    } else {
      progress = rawProgress
      next()
    }
  })
}

const executeCmd = (cmd) => {
  return new Promise((resolve) => {
    let log = ''
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        log += `[/.err.]\n${cmd}\n`
      };
      if (stderr) {
        log += `[/.stderr.]\n${stderr}\n`
      };
      if (stdout) {
        log += `[/.stdout.]\n${stdout}\n`
      };
      resolve(log)
    })
  })
}

const executeNode = async (cmd) => {
  let nodeLogs = ''
  const child = await spawn('node', ['-e', `${cmd}`.replace('nodes ', '')])
  return new Promise((resolve) => {
    child.stderr.on('data', async (err) => {
      nodeLogs += `[/.stderr.]\n${err}\n`
    })
    child.stdout.on('data', async (data) => {
      nodeLogs += `[/.stdout.]\n${data}\n`
    })
    child.on('close', async (code) => {
      nodeLogs += `[/.close.]Code : ${code}`
      resolve(nodeLogs)
    })
  })
}

const utility = {
  makeid,
  copy,
  matchItem,
  capitalLetter,
  timeParse,
  pickRandomObject,
  pickRandomString,
  makeProgressBar,
  executeCmd,
  executeNode
}
module.exports = utility
