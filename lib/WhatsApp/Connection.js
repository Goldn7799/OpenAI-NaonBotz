const { Client, LocalAuth } = require('whatsapp-web.js')
const databases = require('../Database/Database')
const config = require('../../config.json')
const { makeid } = require('../Utility/Utility')

// setup
databases.func.putLog(`[.lightblue.]Open Session <b>${config.bot.session}</b>`)
databases.func.putLog('[.orange.]Conneting to WhatsApp...')
const host = new Client({
  authStrategy: new LocalAuth({
    clientId: config.bot.session
  }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  }
})

// on QR Showed
host.on('qr', (qr) => {
  databases.func.putLog(`[.white.][.qr.]${qr}`)
})

// on loading
const loadingLogId = makeid(8)
host.on('loading_screen', (state) => {
  databases.func.editLog(loadingLogId, `[.white.][.loading.][.qrDone.]-%${state}%-`)
})

// on auth
host.on('authenticated', () => {
  databases.func.putLog('[.yellowgreen.][.loadingDone.][.qrDone.] _Connected to Whatsapp_')
})

// on Ready
host.on('ready', () => {
  databases.func.putLog('[.yellowgreen.]_Client Ready_')
})

module.exports = host
